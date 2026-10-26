void kruskal() {
	while(ne < n) {
		for(i = 1, min = 999; i <= n; i++) {
			for(j = 1; j <= n; j++) {
				if(cost[i][j] < min) {
					min = cost[i][j];
					a = u = i;
					b = v = j;
				}
			}
		}
		u = find(u);
		v = find(v);
		if(uni(u, v)) {
			ne++;
			printf("Edge cost from %d to %d : %d\n", a, b, min);
			mincost += min;
		}
		cost[a][b] = cost[b][a] = 999;
	}
	printf("Minimum cost of spanning tree = %d\n", mincost);
}
