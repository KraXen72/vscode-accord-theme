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
