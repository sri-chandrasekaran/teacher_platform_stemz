import { mean, std } from 'mathjs';
import Plot from 'react-plotly.js';

const GradeCurve = ({ grade_data, course }) => {
      console.log(grade_data)
      
      const grades = grade_data.map(user => user.grade)

      const mu = mean(grades);
      const sigma = std(grades);

      const xValues = Array.from({ length: 100}, (_, i) => i);

      const gaussian = (x, mu, sigma) =>
        (1 / (sigma * Math.sqrt(2 * Math.PI))) * 
        Math.exp(-((x - mu) ** 2) / (2 * sigma ** 2));      

      const yValues = xValues.map(x => gaussian(x, mu, sigma));

      const scaleFactor = grades.length * 5;
      const yValuesScaled = yValues.map(y => y * scaleFactor)

      return(
        <Plot data = {[
            {
                x: grades,
                type: "histogram",
                histnorm: "count",
                autobinx: true,
                name: "Grades",
                marker: {color: "green", opacity: 0.6}
            },
            {
                x: xValues,
                y: yValuesScaled,
                mode: "lines",
                name: "Gaussian Fit",
                line: {color: "blue"}
            }
        ]}
        layout={{
            title: "Grade Distribution with Gaussian Fit",
            xaxis: {
                title: "Grades",
                range: [mu - 3 * sigma, mu + 3 * sigma]
            },
            yaxis: {title: "Frequency"}
        }}
        />
      )
}

export default GradeCurve;