const chartDiv = document.getElementById('plotly-chart');
const searchBox = document.getElementById('search');

// Função para calcular centroides e labels dos clusters, escolhendo o nível do nome
function calcularCentroidesELabels(data, nivelNome = "nome_n0") {
    const clusters = {};
    data.forEach(d => {
        if (!clusters[d.cluster_n0]) clusters[d.cluster_n0] = [];
        clusters[d.cluster_n0].push(d);
    });

    const centroides = [];
    Object.entries(clusters).forEach(([clusterId, arr]) => {
        const cx = arr.reduce((s, d) => s + d.x, 0) / arr.length;
        const cy = arr.reduce((s, d) => s + d.y, 0) / arr.length;
        centroides.push({
            clusterId,
            x: cx,
            y: cy,
            nome: arr[0][nivelNome],
            size: arr.length // quantidade de skills no cluster
        });
    });
    return centroides;
}

// Função para filtrar labels únicos por nome + posição aproximada
function filtrarLabelsUnicosPorNomeEPosicao(centroides, precisao) {
    const labelsUnicos = {};
    centroides.forEach(c => {
        const key = c.nome + "_" +
            (Math.round(c.x / precisao) * precisao) + "_" +
            (Math.round(c.y / precisao) * precisao);
        if (!labelsUnicos[key]) labelsUnicos[key] = c;
    });
    return Object.values(labelsUnicos);
}

let centroides_n2, centroides_n1, centroides_n0;

fetch('visao1.json')
    .then(resp => resp.json())
    .then(data => {
        // FILTRA TODOS OS RUÍDOS (-1)
        const dadosFiltrados = data.filter(d =>
            d.cluster_n0 !== -1 &&
            d.cluster_n1 !== -1 &&
            d.cluster_n2 !== -1 &&
            d.cluster_n3 !== -1
        );

        const cores = [
            "#00bcd4", "#009688", "#607d8b", "#8bc34a", "#388e3c", "#795548", "#03a9f4", "#4caf50",
            "#2196f3", "#5d4037", "#90caf9", "#b0bec5", "#388e3c", "#43a047", "#1976d2", "#00bfae",
            "#689f38", "#263238", "#37474f", "#80cbc4", "#a7ffeb", "#b2dfdb", "#00838f", "#00796b",
            "#33691e", "#789262", "#558b2f", "#546e7a", "#7e57c2", "#3f51b5", "#00acc1", "#26a69a",
            "#607d8b", "#455a64", "#01579b", "#00695c", "#8d6e63", "#1de9b6", "#29b6f6", "#cfd8dc",
            "#b2ebf2", "#b3e5fc", "#8c9eff", "#b388ff", "#00b8d4", "#0097a7", "#6d4c41", "#757575",
            "#c8e6c9", "#c5cae9"
        ];

        const clusterColorMap = {};
        let corIdx = 0;
        dadosFiltrados.forEach(d => {
            if (!(d.cluster_n0 in clusterColorMap)) {
                clusterColorMap[d.cluster_n0] = cores[corIdx % cores.length];
                corIdx += 1;
            }
        });

        const x = dadosFiltrados.map(d => d.x);
        const y = dadosFiltrados.map(d => d.y);
        const color = dadosFiltrados.map(d => clusterColorMap[d.cluster_n0]);
        const labels = dadosFiltrados.map(d => d.skill);

        // Gera centroides para cada nível de nome
        centroides_n2 = calcularCentroidesELabels(dadosFiltrados, "nome_n2");
        centroides_n1 = calcularCentroidesELabels(dadosFiltrados, "nome_n1");
        centroides_n0 = calcularCentroidesELabels(dadosFiltrados, "nome_n0");

        // Filtra labels duplicados já na inicialização do trace
        const centroides_n2_unicos = filtrarLabelsUnicosPorNomeEPosicao(centroides_n2);

        // Trace principal dos pontos
        const trace = {
            x: x,
            y: y,
            mode: 'markers',
            type: 'scattergl',
            marker: {
                color: color,
                size: 12,
                line: { width: 1, color: '#fff' },
                opacity: 0.9
            },
            text: dadosFiltrados.map(d => `
                <b>${d.skill}</b><br>
                <span style="font-size:12px;">Class: ${d.nome_n2}</span><br>
                <span style="font-size:12px;">Area: ${d.nome_n1}</span><br>
                <span style="font-size:12px;">Specific: ${d.nome_n0}</span>
            `),
            hoverinfo: 'text',
            hoverlabel: {
                bgcolor: '#18181b',
                bordercolor: '#38bdf8',
                font: { color: 'white', size: 15, family: 'Inter, sans-serif' }
            }
        };

        // Inicialmente, mostre centroides do nível 2 (mais abrangente) SEM REPETIÇÃO
        let centroidTrace = {
            x: centroides_n2_unicos.map(c => c.x),
            y: centroides_n2_unicos.map(c => c.y),
            mode: 'text',
            type: 'scattergl',
            text: centroides_n2_unicos.map(c => c.nome),
            textfont: {
                color: 'rgba(255,0,0,0.6)',
                size: 30,
                family: 'Inter, sans-serif'
            },
            textposition: 'middle center',
            showlegend: false,
            hoverinfo: 'none'
        };

        const layout = {
            plot_bgcolor: "#0f172a",
            paper_bgcolor: "#0f172a",
            xaxis: { showgrid: false, zeroline: false, visible: false },
            yaxis: { showgrid: false, zeroline: false, visible: false },
            margin: { t: 20, l: 20, r: 20, b: 20 },
            dragmode: 'pan'
        };

        const config = {
            responsive: true,
            scrollZoom: true
        };

        Plotly.newPlot(chartDiv, [trace, centroidTrace], layout, config);

        // Função para atualizar quais labels mostrar conforme zoom + efeito visual
        function atualizarLabelsPorZoom(eixo) {
            const xrange = eixo['xaxis.range[1]'] - eixo['xaxis.range[0]'];
            let clustersMostrados, centroides, labelColor, fontSize, precisao;

            if (xrange > 25) {
                centroides = centroides_n2;
                labelColor = 'rgba(255,0,0,0.6)';
                fontSize = 30;
                precisao = 50;
            } else if (xrange > 10) {
                centroides = centroides_n2;
                labelColor = 'rgba(255,0,0,0.8)';
                fontSize = 28;
                precisao = 70;
            } else if (xrange > 3) {
                centroides = centroides_n1;
                labelColor = 'black';
                fontSize = 26;
                precisao = 80;
            } else {
                centroides = centroides_n0;
                labelColor = 'black';
                fontSize = 26;
                precisao = 100;
            }
           
            const clustersUnicos = filtrarLabelsUnicosPorNomeEPosicao(centroides, precisao);
            Plotly.restyle(chartDiv, {
                x: [clustersUnicos.map(c => c.x)],
                y: [clustersUnicos.map(c => c.y)],
                text: [clustersUnicos.map(c => c.nome)],
                'textfont.color': labelColor,
                'textfont.size': fontSize
            }, [1]);
        }

        // Atualize os labels sempre que der zoom/mover
        chartDiv.on('plotly_relayout', (eixo) => {
            if (eixo['xaxis.range[0]'] !== undefined && eixo['xaxis.range[1]'] !== undefined) {
                atualizarLabelsPorZoom(eixo);
            }
        });

        // Adiciona a funcionalidade de busca 
        let currentMatches = [];
        let currentMatchIndex = 0;

        searchBox.addEventListener('input', () => {
            const termo = searchBox.value.toLowerCase();
            currentMatches = [];
            currentMatchIndex = 0;

            if (termo.length > 0) {
                dadosFiltrados.forEach((d, idx) => {
                    if (d.skill.toLowerCase().includes(termo)) {
                        currentMatches.push(idx);
                    }
                });
            }

            if (currentMatches.length > 0) {
                const idx = currentMatches[currentMatchIndex];
                const zoom = 1;
                Plotly.relayout(chartDiv, {
                    'xaxis.range': [x[idx] - zoom, x[idx] + zoom],
                    'yaxis.range': [y[idx] - zoom, y[idx] + zoom],
                });
            }
        });

        // Avança para o próximo resultado ao apertar Enter
        searchBox.addEventListener('keydown', (event) => {
            if (event.key === "Enter" && currentMatches.length > 0) {
                currentMatchIndex = (currentMatchIndex + 1) % currentMatches.length;
                const idx = currentMatches[currentMatchIndex];
                const zoom = 1;
                Plotly.relayout(chartDiv, {
                    'xaxis.range': [x[idx] - zoom, x[idx] + zoom],
                    'yaxis.range': [y[idx] - zoom, y[idx] + zoom],
                });
            }
        });
    });
