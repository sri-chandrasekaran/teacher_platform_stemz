import { mean, std } from 'mathjs';
import Plot from 'react-plotly.js';

const GradeCurve = ({ grade_data, course }) => {
    // console.log("grade_data: " + grade_data)
    // console.log("course: " + course.name)

    let student_grades = {}
    for (const grade of grade_data) {
        // console.log("Grade: " + grade.grade)
        // console.log("Student ID: " + grade.student_user_id)
        if (grade.student_user_id && !(grade.student_user_id in student_grades)) {
            student_grades[grade.student_user_id] = [grade.grade];
        }
        else if (grade.student_user_id) {
            student_grades[grade.student_user_id].push(grade.grade);
        }
    }

    let grades = []
    for (const student_id in student_grades) {
        let grade = student_grades[student_id].reduce((a, b) => a + b, 0) / student_grades[student_id].length;
        // console.log("Student ID: " + student_id + " Grade: " + grade)
        grades.push(grade);
    }
    // console.log("Student Course Grade: " + grades)

    // const grades = Object.values(student_course_grades);

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
        <Plot className = "grade-curve" data = {[
            {
                x: grades,
                type: "histogram",
                histnorm: "count",
                xbins: {
                    size: 5 // Set bucket size to 5
                },
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