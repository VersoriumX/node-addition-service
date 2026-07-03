function initMetalChart(ctx) {
    const metals = {
        gold: { color: 'gold', symbol: 'XAU' },
        platinum: { color: 'plum', symbol: 'XPT' },
        silver: { color: 'silver', symbol: 'XAG' },
        nickel: { color: 'lightblue', symbol: 'NICKEL' },
        copper: { color: 'brown', symbol: 'COPPER' }
    };

    const datasets = Object.keys(metals).map(metal => ({
        label: metal.charAt(0).toUpperCase() + metal.slice(1),
        borderColor: metals[metal].color,
        backgroundColor: metals[metal].color,
        data: [],
        fill: false,
        tension: 0.1
    }));

    return new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: datasets
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: false
                }
            }
        }
    });
}

function updateChart(chart, prices) {
    const now = new Date().toLocaleTimeString();
    chart.data.labels.push(now);

    Object.keys(prices).forEach(metal => {
        const dataset = chart.data.datasets.find(ds => ds.label.toLowerCase() === metal.toLowerCase());
        if (dataset) {
            dataset.data.push(prices[metal]);
        }
    });

    if (chart.data.labels.length > 20) {
        chart.data.labels.shift();
        chart.data.datasets.forEach(dataset => dataset.data.shift());
    }

    chart.update();
}
