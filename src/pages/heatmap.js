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

  return <Plot data={data} layout={{ title: 'Engagement of Assignments' }} />;
};

export default PlotlyHeatmap;
