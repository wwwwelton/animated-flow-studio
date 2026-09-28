"""Package a clean committed checkout with a self-contained Git history."""

from __future__ import annotations
import argparse
from pathlib import Path
import subprocess
import tempfile
import zipfile

ROOT = Path(__file__).resolve().parents[1]


def git(repo: Path, *args: str) -> str:
    return subprocess.check_output(
        ["git", "-C", str(repo), *args], text=True, stderr=subprocess.PIPE
    ).strip()


def package(output: Path) -> Path:
    if git(ROOT, "status", "--porcelain", "--untracked-files=all"):
        raise ValueError(
            "Faça commit das alterações antes de empacotar; a árvore deve estar limpa."
        )
    branch = git(ROOT, "symbolic-ref", "--quiet", "--short", "HEAD")
    output = output.resolve()
    if output == ROOT or ROOT.is_relative_to(output):
        raise ValueError("O destino precisa ser um arquivo ZIP.")
    output.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix="animated-flow-release-") as temp:
        checkout = Path(temp) / "animated_flow"
        subprocess.run(
            [
                "git",
                "-c",
                "core.autocrlf=false",
                "clone",
                "--no-local",
                "--branch",
                branch,
                str(ROOT),
                str(checkout),
            ],
            check=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
        )
        git(checkout, "remote", "remove", "origin")
        # Portable config only: never distribute the developer's settings or remotes.
        (checkout / ".git/config").write_text(
            "[core]\n\trepositoryformatversion = 0\n\tfilemode = false\n"
            "\tbare = false\n\tlogallrefupdates = true\n",
            encoding="utf-8",
        )
        if git(checkout, "status", "--porcelain"):
            raise ValueError("O checkout de distribuição não está limpo.")
        temporary_zip = Path(temp) / "release.zip"
        with zipfile.ZipFile(temporary_zip, "w", zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
            for file in sorted(checkout.rglob("*")):
                relative = file.relative_to(checkout)
                if relative.parts[:2] in ((".git", "hooks"), (".git", "logs")):
                    continue
                if file.is_file():
                    archive.write(file, Path("animated_flow") / relative)
        with zipfile.ZipFile(temporary_zip) as archive:
            bad = archive.testzip()
            if bad:
                raise ValueError(f"Falha na integridade do ZIP: {bad}")
        import shutil

        shutil.copyfile(temporary_zip, output)
    return output


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path, default=ROOT / "dist/animated-flow-studio.zip")
    args = parser.parse_args()
    try:
        print(package(args.output))
    except (ValueError, subprocess.CalledProcessError, OSError) as error:
        detail = error.stderr if isinstance(error, subprocess.CalledProcessError) else str(error)
        parser.exit(1, f"Não foi possível empacotar: {detail}\n")


if __name__ == "__main__":
    main()
