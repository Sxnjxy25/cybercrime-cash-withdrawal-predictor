import networkx as nx
from typing import Dict, List, Any

class EntityEngine:
    def __init__(self):
        self.graph = nx.Graph()

    def build_relationship_graph(self, complaints: list, entities: list) -> Dict[str, Any]:
        """
        Build an entity-complaint correlation graph using NetworkX and return Nodes & Edges format for React Flow.
        """
        self.graph.clear()
        
        # Add entity nodes
        for ent in entities:
            self.graph.add_node(
                ent['id'],
                label=ent['masked_value'],
                type=ent['entity_type'],
                risk=ent['risk_score'],
                complaints=ent['total_complaints'],
                node_type="ENTITY"
            )
            
        # Add complaint nodes & edges
        for c in complaints:
            c_node_id = f"CMP-{c['id'][:8]}"
            self.graph.add_node(
                c_node_id,
                label=c['complaint_number'],
                type="COMPLAINT",
                category=c['category'],
                state=c['state'],
                node_type="COMPLAINT"
            )
            
            # Connect entities to complaint
            if c.get('upi_identifier'):
                e_id = f"ENT-UPI-{c['upi_identifier']}"
                if self.graph.has_node(e_id):
                    self.graph.add_edge(c_node_id, e_id, relationship="reported in")
            if c.get('mobile_identifier'):
                e_id = f"ENT-MOB-{c['mobile_identifier']}"
                if self.graph.has_node(e_id):
                    self.graph.add_edge(c_node_id, e_id, relationship="associated with")

        # Convert NetworkX graph to React Flow structure
        nodes = []
        edges = []
        
        for n, data in self.graph.nodes(data=True):
            node_type = data.get('node_type', 'ENTITY')
            nodes.append({
                "id": str(n),
                "type": "customNode",
                "data": {
                    "label": data.get('label', str(n)),
                    "entityType": data.get('type', 'UNKNOWN'),
                    "risk": data.get('risk', 50.0),
                    "complaints": data.get('complaints', 1),
                    "nodeCategory": node_type
                },
                "position": {"x": 100 + (len(nodes) % 5) * 180, "y": 80 + (len(nodes) // 5) * 120}
            })
            
        edge_idx = 1
        for u, v, d in self.graph.edges(data=True):
            edges.append({
                "id": f"e-{edge_idx}",
                "source": str(u),
                "target": str(v),
                "label": d.get('relationship', 'potentially related to'),
                "animated": True
            })
            edge_idx += 1
            
        return {
            "nodes": nodes,
            "edges": edges,
            "summary": {
                "total_nodes": self.graph.number_of_nodes(),
                "total_edges": self.graph.number_of_edges(),
                "connected_components": nx.number_connected_components(self.graph) if self.graph.number_of_nodes() > 0 else 0
            }
        }

entity_engine = EntityEngine()
