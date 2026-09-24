const test=require('node:test'),assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs'),os=require('node:os'),{spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..'),runner=path.join(__dirname,'editor-task.js'),fixture=path.join(__dirname,'font-fixture.js');
test('task CLI explains usage without opening a browser and rejects invalid input cleanly',()=>{
 const help=spawnSync(process.execPath,[runner,'--help'],{encoding:'utf8'});assert.equal(help.status,0);assert.match(help.stdout,/Sem argumento.*--all/);assert.equal(help.stderr,'');
 for(const args of [['unknown'],['constructor'],['10','11']]){const r=spawnSync(process.execPath,[runner,...args],{encoding:'utf8'});assert.equal(r.status,2);assert.match(r.stderr,/Tarefa inválida/);assert.ok(!r.stderr.includes('AssertionError'));}
});
test('font fixture uses bundled TTF from any working directory and explains bad overrides',()=>{
 const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'afs-font-'));
 try{
  const env={...process.env};delete env.AFS_TEST_FONT_PATH;
  const code=`const f=require(${JSON.stringify(fixture)}).readTestFont();if(f.readUInt32BE(0)!==0x10000)throw Error('Invalid TTF');console.log(f.length);`;
  const r=spawnSync(process.execPath,['-e',code],{cwd:tmp,env,encoding:'utf8'});assert.equal(r.status,0,r.stderr);assert.ok(Number(r.stdout)>1000);
  const custom=path.join(tmp,'custom.ttf');fs.copyFileSync(path.join(root,'tests/fixtures/DejaVuSans.ttf'),custom);
  const valid=spawnSync(process.execPath,['-e',code],{cwd:tmp,env:{...env,AFS_TEST_FONT_PATH:custom},encoding:'utf8'});assert.equal(valid.status,0,valid.stderr);
  const bad=spawnSync(process.execPath,['-e',code],{cwd:tmp,env:{...env,AFS_TEST_FONT_PATH:path.join(tmp,'missing.ttf')},encoding:'utf8'});assert.notEqual(bad.status,0);assert.match(bad.stderr,/Corrija AFS_TEST_FONT_PATH/);
 }finally{fs.rmSync(tmp,{recursive:true,force:true});}
});
