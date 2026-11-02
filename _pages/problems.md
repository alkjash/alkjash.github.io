---
layout: archive
title: "Problems"
permalink: /problems/
author_profile: true
---

Here are some open problems I like, with references to related papers of mine (not necessarily the origin of the problem).

## Open problems

1. The *(oriented) Ramsey number $r(H)$* of an (acyclic) directed graph $H$ is the smallest $N$ such that every tournament on $N$ vertices contains a copy of $H$.
If $H$ has bounded degree, is $r(H)$ always bounded by a polynomial in the number of vertices of $H$? [[reference]](https://arxiv.org/abs/2105.02383)
2. Let $f(K_n, p)$ be the number of adjacency queries needed to find (with constant probability) a copy of a target graph $H$ in an infinite Erdős–Rényi random graph with edge probability $p$. It is known that as $p\rightarrow 0^+$, $$ p^{-(2-\sqrt{2})n+O(1)} \ll f(K_n,p) \ll p^{-2n/3 +O(1)}$$. What is the true growth rate of $f(K_n,p)$ as $p\rightarrow 0^+$? [[reference]](https://arxiv.org/abs/1806.09726)

## Solved problems

1. A permutation $\sigma$ is called *$k$-universal* if it contains every permutation of length $k$ as a pattern. Is it true that a random permutation of length $1000k^2$ is $k$-universal with high probability? [[reference]](https://arxiv.org/abs/1911.12878) **Solved by Yu Chen and Yiting Wang (2026):** a uniformly random permutation of length $32k^2$ is $k$-universal with high probability. [[Solved!]](https://arxiv.org/abs/2610.13530)

2. Let $H$ be a $3$-uniform hypergraph. When is an $H$-free $3$-uniform hypergraph guaranteed to have a polynomially large independent set? This happens exactly when $H$ is contained in an iterated blowup of a single edge. **Solved by Lior Gishboliner, Sepehr Hajebi, and Xiangyu Li (2026).** [[reference]](https://arxiv.org/abs/2411.13812) [[Solved!]](https://arxiv.org/abs/2610.32644)

3. A *binary shuffle square of length $n$* is a bitstring $s\in \{0,1\}^n$ that can be partitioned into two disjoint identical subsequences. Thus, $101101$ and $110000$ are binary shuffle squares of length $6$, but $110010$ and $100111$ are not. If $n$ is even, is the number of binary shuffle squares of length $n$ asymptotic to $2^{n-1}$? [[reference]](https://arxiv.org/abs/2109.12455) **Solved by Xiaoyu He and Logan Post (2025).** [[Solved!]](https://arxiv.org/abs/2512.12077)
