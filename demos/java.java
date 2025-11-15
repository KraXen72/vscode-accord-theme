package weblab;

import java.util.*;

class Node {

    List<Node> outgoingEdges;

    boolean marked;

    public Node() {
        this.outgoingEdges = new ArrayList<>();
        this.marked = false;
    }
}

class Solution {

    /**
     * @param nodes the nodes in the graph
     * @param s the starting node
     * @param t the final node
     * @return true iff there is a path from the start node to the final node
     */
    public static boolean solve(Set<Node> nodes, Node s, Node t) {
        // TODO
    }

	public static void solve2(boolean include, ArrayList<Node> list, int number) {
        // TODO
    }
}

class Edge {

    int from, to;

    public Edge(int from, int to) {
        this.from = from;
        this.to = to;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Edge edge = (Edge) o;
        return from == edge.from && to == edge.to;
    }

    @Override
    public int hashCode() {
        return Objects.hash(from, to);
    }
}

class Solution {

    public static List<ArrayList<int>> makeAdjList(int n, Set<Edge> edges) {
        
    }

    /**
     * @param n the number of nodes
     * @param m the number of edges
     * @param edges the set of edges, with endpoints labelled between 1 and n inclusive.
     * @return true iff there is a cycle in the graph
     */
    public static boolean isThereACycle(int n, int m, Set<Edge> edges) {
        var stack = new ArrayDeque<Edge>();
        
    }
}

class Solution2 {

    /**
     * @param n the number of nodes
     * @param m the number of edges
     * @param edges the set of edges, with endpoints labelled between 1 and n inclusive.
     * @return true iff there is a cycle in the graph
     */
    public static boolean isThereACycle2(int n, int m, Set<Edge> edges) {
        var adjlist = new HashMap<Integer, ArrayList<Integer>>();
        var inDegree = new int[n + 1];
        
        // Build adjacency list and in-degree array
        for (Edge e : edges) {
            adjlist.computeIfAbsent(e.from, k -> new ArrayList<>()).add(e.to);
            inDegree[e.to]++;
        }
        
        var queue = new ArrayDeque<Integer>();
        // Enqueue all nodes with in-degree 0
        for (int i = 1; i <= n; i++) {
            if (inDegree[i] == 0) {
                queue.add(i);
            }
        }
        
        int count = 0;
        while (!queue.isEmpty()) {
            int node = queue.removeFirst();
            count++;
            for (int neighbor : adjlist.getOrDefault(node, new ArrayList<>())) {
                inDegree[neighbor]--;
                if (inDegree[neighbor] == 0) {
                    queue.add(neighbor);
                }
            }
        }
        
        // If count != n, there is a cycle
        return count != n;
    } 

	public static boolean isThereACycle3(
		int n,
		Set<Edge> edges
		ArrayList<Integer> al,
		Map<Integer, ArrayList<Integer>> mapper,
		boolean monkey,
		String yeah
	) {
		System.out.println("sigma.rizz")
	}
}