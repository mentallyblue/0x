class NetworkView {
    constructor() {
        this.svg = null;
        this.simulation = null;
        this.nodes = [];
        this.links = [];
        this.width = 800;
        this.height = 600;
    }

    initialize() {
        this.svg = d3.select('#network-view')
            .append('svg')
            .attr('width', this.width)
            .attr('height', this.height);

        // Add zoom behavior
        const zoom = d3.zoom()
            .scaleExtent([0.1, 4])
            .on('zoom', (event) => {
                this.svg.selectAll('g').attr('transform', event.transform);
            });

        this.svg.call(zoom);

        // Create arrow marker for links
        this.svg.append('defs').append('marker')
            .attr('id', 'arrowhead')
            .attr('viewBox', '-5 -5 10 10')
            .attr('refX', 15)
            .attr('refY', 0)
            .attr('orient', 'auto')
            .attr('markerWidth', 8)
            .attr('markerHeight', 8)
            .append('path')
            .attr('d', 'M -5,-5 L 5,0 L -5,5')
            .attr('fill', '#33ff33');
    }

    updateData(posts) {
        console.log('Updating network with posts:', posts);
        // Convert posts to nodes and links
        this.nodes = [];
        this.links = [];
        const nodeMap = new Map();

        // Create nodes for agents
        posts.forEach(post => {
            if (!nodeMap.has(post.agent.id)) {
                nodeMap.set(post.agent.id, {
                    id: post.agent.id,
                    name: post.agent.name,
                    type: post.agent.type,
                    group: post.agent.type
                });
            }
        });

        console.log('Created nodes:', this.nodes);
        console.log('Created links:', this.links);

        // Create links for replies
        posts.forEach(post => {
            if (post.context.replyTo) {
                const sourcePost = posts.find(p => p.id === post.context.replyTo);
                if (sourcePost) {
                    this.links.push({
                        source: post.agent.id,
                        target: sourcePost.agent.id,
                        value: 1
                    });
                }
            }
        });

        this.nodes = Array.from(nodeMap.values());
        this.render();
    }

    render() {
        console.log('Rendering network with:', {
            nodes: this.nodes,
            links: this.links
        });

        if (!this.simulation) {
            this.simulation = d3.forceSimulation(this.nodes)
                .force('link', d3.forceLink(this.links).id(d => d.id))
                .force('charge', d3.forceManyBody().strength(-100))
                .force('center', d3.forceCenter(this.width / 2, this.height / 2));
        }

        // Update links
        const link = this.svg.selectAll('.link')
            .data(this.links)
            .join('line')
            .attr('class', 'link')
            .attr('stroke', '#33ff33')
            .attr('stroke-opacity', 0.6)
            .attr('marker-end', 'url(#arrowhead)');

        // Update nodes
        const node = this.svg.selectAll('.node')
            .data(this.nodes)
            .join('g')
            .attr('class', 'node')
            .call(d3.drag()
                .on('start', this.dragstarted.bind(this))
                .on('drag', this.dragged.bind(this))
                .on('end', this.dragended.bind(this)));

        node.selectAll('circle').remove();
        node.selectAll('text').remove();

        node.append('circle')
            .attr('r', 5)
            .attr('fill', d => this.getColorForType(d.type));

        node.append('text')
            .text(d => `${d.name} (${d.type})`)
            .attr('x', 8)
            .attr('y', 4)
            .attr('fill', '#33ff33')
            .style('font-family', 'monospace')
            .style('font-size', '12px');

        this.simulation
            .nodes(this.nodes)
            .on('tick', () => {
                link
                    .attr('x1', d => d.source.x)
                    .attr('y1', d => d.source.y)
                    .attr('x2', d => d.target.x)
                    .attr('y2', d => d.target.y);

                node
                    .attr('transform', d => `translate(${d.x},${d.y})`);
            });

        this.simulation.force('link').links(this.links);
        this.simulation.alpha(1).restart();
    }

    getColorForType(type) {
        const colors = {
            'dreamer': '#ffd700',
            'test': '#3366ff',
            'default': '#33ff33'
        };
        return colors[type] || colors.default;
    }

    dragstarted(event) {
        if (!event.active) this.simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
    }

    dragged(event) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
    }

    dragended(event) {
        if (!event.active) this.simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
    }
} 