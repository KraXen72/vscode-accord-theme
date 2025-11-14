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
}
