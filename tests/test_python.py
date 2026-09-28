import unittest
from animated_flow import Diagram, Node, Edge, Legend


class PythonAPI(unittest.TestCase):
    def test_element_colors(self):
        d = Diagram("Cores").add_node(
            Node(
                "a",
                "A",
                50,
                50,
                color="#fff1cc",
                border_color="#912345",
                text_color="#164567",
                subtitle_color="#765432",
                icon_color="#123abc",
            )
        )
        d.add_node(Node("b", "B", 300, 50)).add_edge(
            Edge("a", "b", stroke_color="#117744", text_color="#773399")
        )
        data = d.to_dict()
        self.assertEqual(data["nodes"][0]["borderColor"], "#912345")
        self.assertEqual(data["nodes"][0]["textColor"], "#164567")
        self.assertEqual(data["nodes"][0]["subtitleColor"], "#765432")
        self.assertEqual(data["nodes"][0]["iconColor"], "#123abc")
        self.assertEqual(data["edges"][0]["strokeColor"], "#117744")
        self.assertEqual(data["edges"][0]["textColor"], "#773399")
        self.assertIn('"strokeColor": "#117744"', d.render())

    def test_roundtrip_data(self):
        d = Diagram("Exemplo").add_node(Node("a", "A", 50, 50)).add_node(Node("b", "B", 300, 50))
        d.add_edge(Edge("a", "b"))
        data = d.to_dict()
        self.assertEqual(data["edges"][0]["traffic"], ["request", "response"])
        self.assertEqual(data["nodes"][0]["w"], 190)

    def test_traffic_icon_defaults_to_one_rem(self):
        diagram = Diagram("Fluxo").add_legend(Legend("events", "Eventos"))
        self.assertEqual(diagram.to_dict()["legends"][0]["size"], 16)

    def test_growth_settings(self):
        d = Diagram("Canvas", auto_grow=False, growth_margin=80)
        self.assertFalse(d.to_dict()["autoGrow"])
        self.assertEqual(d.to_dict()["growthMargin"], 80)
        with self.assertRaises(ValueError):
            Diagram("Canvas", growth_margin=-5)

    def test_duplicate_node(self):
        d = Diagram("Teste").add_node(Node("a", "A", 0, 0))
        with self.assertRaises(ValueError):
            d.add_node(Node("a", "B", 0, 0))

    def test_reject_missing_endpoint(self):
        with self.assertRaises(ValueError):
            Diagram("Teste").add_edge(Edge("x", "y"))

    def test_html_payload_escaping(self):
        d = Diagram("</script><script>bad</script>")
        html = d.render()
        self.assertNotIn('FlowCore.normalize({"version": 2, "title": "</script>', html)
        self.assertIn("\\u003c/script>", html)

    def test_custom_legend(self):
        d = Diagram("Teste").add_legend(Legend("error", "Erro", "#ff0000", "diamond"))
        d.add_node(Node("a", "A", 0, 0)).add_node(Node("b", "B", 300, 0))
        d.add_edge(Edge("a", "b", traffic=("error",)))
        self.assertEqual(d.to_dict()["edges"][0]["traffic"], ["error"])

    def test_api_protocol_symbols_are_valid_legend_shapes(self):
        protocols = ("rest", "graphql", "grpc", "websocket", "webhook", "sse", "mqtt")
        diagram = Diagram("Protocolos")
        for protocol in protocols:
            diagram.add_legend(Legend(f"traffic-{protocol}", protocol, shape=protocol))

        shapes = [legend["shape"] for legend in diagram.to_dict()["legends"][-len(protocols) :]]
        self.assertEqual(shapes, list(protocols))


if __name__ == "__main__":
    unittest.main()
