import { mean, std } from 'mathjs';
import Plot from 'react-plotly.js';

const GradeCurve = () => {
    const activeUsers = [
        { name: "Alice Johnson", grade: 95, completion: 100 },
        { name: "Bob Smith", grade: 87, completion: 90 },
        { name: "Charlie Brown", grade: 78, completion: 85 },
        { name: "Diana Ross", grade: 82, completion: 95 },
        { name: "Ethan Hunt", grade: 91, completion: 100 },
        { name: "Fiona Carter", grade: 88, completion: 92 },
        { name: "George Miller", grade: 76, completion: 80 },
        { name: "Hannah Lee", grade: 92, completion: 100 },
        { name: "Ian Thompson", grade: 85, completion: 88 },
        { name: "Jessica Parker", grade: 89, completion: 93 },
        { name: "Kevin Martinez", grade: 73, completion: 70 },
        { name: "Lily Adams", grade: 97, completion: 100 },
        { name: "Michael Scott", grade: 81, completion: 78 },
        { name: "Natalie Brooks", grade: 90, completion: 96 },
        { name: "Oliver Davis", grade: 79, completion: 82 }
      ];
    
      const grades = activeUsers.map(user => user.grade)

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