import Plot from 'react-plotly.js';

const PlotlyHeatmap = () => {
  const data = [
    {
      z: [
        [30, 50, 70],
        [20, 60, 80],
        [10, 40, 90],
        [55, 62, 30]
      ],
      x: ['Slides', 'Worksheets', 'Quizzes'],
      y: ['Lesson 1', 'Lesson 2', 'Lesson 3', 'Lesson 4'],
      type: 'heatmap',
      colorscale: 'Greens',
      colorbar: {
        title: 'Engagement',
        titleside: 'right',
      },
    },
  ];

  const layout = {
    title: {
      text: 'Engagement of Assignments',
      font: {
        size: 24,
        family: 'Arial, sans-serif',
        color: '#2c3e50',
      },
    },
    xaxis: {
      title: {
        text: 'Assignment Types',
        font: {
          size: 16,
          family: 'Arial, sans-serif',
          color: '#34495e',
        },
      },
    },
    yaxis: {
      title: {
        text: 'Lessons',
        font: {
          size: 16,
          family: 'Arial, sans-serif',
          color: '#34495e',
        },
      },
    },
    margin: {
      l: 50,
      r: 50,
      t: 80,
      b: 50,
    },
    paper_bgcolor: '#f9f9f9',
    plot_bgcolor: '#ffffff',
  };

  return <Plot data={data} layout={{ title: 'Engagement of Assignments' }} />;
};

export default PlotlyHeatmap;
