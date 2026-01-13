import { useCallback, useState } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  BackgroundVariant,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

interface NodeData {
  label: string;
  type: 'domain' | 'subdomain' | 'ip' | 'technology' | 'service';
  info?: string;
}

const initialNodes: Node<NodeData>[] = [
  {
    id: '1',
    type: 'default',
    position: { x: 400, y: 100 },
    data: { label: 'Start analyzing a domain', type: 'domain' },
    style: {
      background: '#6366f1',
      color: 'white',
      border: '2px solid #4f46e5',
      borderRadius: '8px',
      padding: '10px',
      fontSize: '14px',
      fontWeight: 'bold',
    },
  },
];

const initialEdges: Edge[] = [];

export default function NexusGraph() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [domain, setDomain] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedNode, setSelectedNode] = useState<Node<NodeData> | null>(null);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const analyzeDomain = async () => {
    if (!domain.trim()) return;

    setLoading(true);

    // Clear existing nodes and edges
    const newNodes: Node<NodeData>[] = [];
    const newEdges: Edge[] = [];
    let nodeId = 0;

    // Create domain node
    const domainNode: Node<NodeData> = {
      id: String(nodeId++),
      type: 'default',
      position: { x: 400, y: 50 },
      data: { label: domain, type: 'domain', info: `Primary domain: ${domain}` },
      style: {
        background: '#6366f1',
        color: 'white',
        border: '2px solid #4f46e5',
        borderRadius: '8px',
        padding: '12px',
        fontSize: '16px',
        fontWeight: 'bold',
      },
    };
    newNodes.push(domainNode);

    // Simulate DNS lookup and subdomain discovery
    setTimeout(() => {
      // Add subdomains
      const subdomains = ['www', 'api', 'mail', 'ftp', 'admin'];
      const subdomainY = 200;
      subdomains.forEach((subdomain, index) => {
        const subdomainNode: Node<NodeData> = {
          id: String(nodeId++),
          type: 'default',
          position: { x: 100 + index * 150, y: subdomainY },
          data: {
            label: `${subdomain}.${domain}`,
            type: 'subdomain',
            info: `Subdomain discovered: ${subdomain}`,
          },
          style: {
            background: '#8b5cf6',
            color: 'white',
            border: '1px solid #7c3aed',
            borderRadius: '6px',
            padding: '10px',
            fontSize: '12px',
          },
        };
        newNodes.push(subdomainNode);

        // Create edge from domain to subdomain
        newEdges.push({
          id: `e${domainNode.id}-${subdomainNode.id}`,
          source: domainNode.id,
          target: subdomainNode.id,
          type: 'smoothstep',
          animated: true,
          markerEnd: { type: MarkerType.ArrowClosed },
          style: { stroke: '#8b5cf6' },
        });
      });

      // Add IP addresses
      const ips = ['192.168.1.1', '10.0.0.1'];
      const ipY = 350;
      ips.forEach((ip, index) => {
        const ipNode: Node<NodeData> = {
          id: String(nodeId++),
          type: 'default',
          position: { x: 250 + index * 200, y: ipY },
          data: {
            label: ip,
            type: 'ip',
            info: `Resolved IP address: ${ip}`,
          },
          style: {
            background: '#10b981',
            color: 'white',
            border: '1px solid #059669',
            borderRadius: '6px',
            padding: '10px',
            fontSize: '12px',
          },
        };
        newNodes.push(ipNode);

        // Create edges from subdomains to IPs
        const sourceSubdomain = newNodes[1 + index % subdomains.length];
        newEdges.push({
          id: `e${sourceSubdomain.id}-${ipNode.id}`,
          source: sourceSubdomain.id,
          target: ipNode.id,
          type: 'smoothstep',
          markerEnd: { type: MarkerType.ArrowClosed },
          style: { stroke: '#10b981' },
        });
      });

      // Add technologies/services
      const technologies = [
        { name: 'nginx', color: '#06b6d4' },
        { name: 'Node.js', color: '#06b6d4' },
        { name: 'PostgreSQL', color: '#06b6d4' },
      ];
      const techY = 500;
      technologies.forEach((tech, index) => {
        const techNode: Node<NodeData> = {
          id: String(nodeId++),
          type: 'default',
          position: { x: 200 + index * 200, y: techY },
          data: {
            label: tech.name,
            type: 'technology',
            info: `Technology detected: ${tech.name}`,
          },
          style: {
            background: tech.color,
            color: 'white',
            border: `1px solid ${tech.color}`,
            borderRadius: '6px',
            padding: '8px',
            fontSize: '11px',
          },
        };
        newNodes.push(techNode);

        // Create edges from IPs to technologies
        const sourceIp = newNodes[newNodes.length - technologies.length - ips.length + index % ips.length];
        newEdges.push({
          id: `e${sourceIp.id}-${techNode.id}`,
          source: sourceIp.id,
          target: techNode.id,
          type: 'smoothstep',
          markerEnd: { type: MarkerType.ArrowClosed },
          style: { stroke: tech.color, strokeDasharray: '5,5' },
        });
      });

      setNodes(newNodes);
      setEdges(newEdges);
      setLoading(false);
    }, 1000);
  };

  const autoLayout = () => {
    // Simple grid layout
    const nodesCopy = nodes.map((node, index) => ({
      ...node,
      position: {
        x: (index % 5) * 200 + 50,
        y: Math.floor(index / 5) * 150 + 50,
      },
    }));
    setNodes(nodesCopy);
  };

  const clearGraph = () => {
    setNodes(initialNodes);
    setEdges(initialEdges);
    setDomain('');
    setSelectedNode(null);
  };

  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node<NodeData>) => {
    setSelectedNode(node);
  }, []);

  const getNodeTypeCount = (type: string) => {
    return nodes.filter((n) => n.data.type === type).length;
  };

  return (
    <div className="flex h-full bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-6 overflow-y-auto">
        <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Nexus Graph</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Visualize domain infrastructure and relationships
        </p>

        {/* Domain Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Target Domain
          </label>
          <input
            type="text"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="example.com"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            onKeyPress={(e) => {
              if (e.key === 'Enter') analyzeDomain();
            }}
          />
          <button
            onClick={analyzeDomain}
            disabled={!domain.trim() || loading}
            className="w-full mt-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Analyzing...' : 'Analyze Domain'}
          </button>
        </div>

        {/* Controls */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={autoLayout}
            className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
          >
            Auto Layout
          </button>
          <button
            onClick={clearGraph}
            className="flex-1 px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
          >
            Clear
          </button>
        </div>

        {/* Selected Node Info */}
        {selectedNode && (
          <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Selected Node</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-600 dark:text-gray-400">Type: </span>
                <span className="font-medium text-gray-900 dark:text-white capitalize">
                  {selectedNode.data.type}
                </span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Label: </span>
                <span className="font-medium text-gray-900 dark:text-white">{selectedNode.data.label}</span>
              </div>
              {selectedNode.data.info && (
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Info: </span>
                  <span className="font-medium text-gray-900 dark:text-white">{selectedNode.data.info}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Statistics */}
        <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Graph Statistics</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Total Nodes:</span>
              <span className="font-medium text-gray-900 dark:text-white">{nodes.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Total Edges:</span>
              <span className="font-medium text-gray-900 dark:text-white">{edges.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Domains:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {getNodeTypeCount('domain')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Subdomains:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {getNodeTypeCount('subdomain')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">IP Addresses:</span>
              <span className="font-medium text-gray-900 dark:text-white">{getNodeTypeCount('ip')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Technologies:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {getNodeTypeCount('technology')}
              </span>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Legend</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-indigo-600"></div>
              <span className="text-gray-700 dark:text-gray-300">Domain</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-purple-600"></div>
              <span className="text-gray-700 dark:text-gray-300">Subdomain</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-600"></div>
              <span className="text-gray-700 dark:text-gray-300">IP Address</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-cyan-600"></div>
              <span className="text-gray-700 dark:text-gray-300">Technology</span>
            </div>
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm text-blue-900 dark:text-blue-200">
            <strong>Note:</strong> This is a demonstration mode. In production, this would integrate with real
            DNS lookups, subdomain enumeration, and technology fingerprinting APIs.
          </p>
        </div>
      </div>

      {/* Graph Canvas */}
      <div className="flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          fitView
          attributionPosition="bottom-left"
        >
          <Controls />
          <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
        </ReactFlow>
      </div>
    </div>
  );
}
