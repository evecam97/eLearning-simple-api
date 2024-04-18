const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
const port = 3000;

app.use(bodyParser.json());



app.get('/courses', (req, res) => {
  try {
    const courses = constructCourseDataJson();
    res.send(courses);
  } catch (error) {
    console.error("error")
    res.status(500).send(error)
  }
});

app.get('/course/:name', (req, res) => {
  try {
    const course = req.params.name;
    const lessonData = constructLessonsDataJson(course);
    res.send(lessonData);
  } catch (error) {
    console.error("error")
    res.status(500).send(error)
  }
});

app.get('/answers/:name', (req, res) => {
  try {
    const lesson = req.params.name;
    const answersData = getAnswers(lesson);
    res.send(answersData);
  } catch (error) {
    console.error("error")
    res.status(500).send(error)
  }
});

app.post('/evaluateLesson', (req, res) => {
  const { name, answers, student } = req.body;
  const resultLesson = evaluateLesson(name, answers, student);
  res.json(resultLesson);
});

app.post('/createCourse', (req, res) => {
  const { course, lessons } = req.body;
  const result = createCourse(course, lessons, req.body);
  res.json(result);
});

app.put('/updateCourse', (req, res) => {
  const { course, lessons } = req.body;
  const result = updateCourse(course, lessons, req.body);
  res.json(result);
});

app.post('/createLesson', (req, res) => {
  const { course, lessons } = req.body;
  const result = createLesson(course, lessons, req.body);
  res.json(result);
});

app.put('/updateLesson', (req, res) => {
  const { course, lessons, newLesson } = req.body;
  const result = updateLesson(course, lessons, newLesson, req.body);
  res.json(result);
});

app.post('/createQuestion', (req, res) => {
  const { name,approvalTreshold,answers } = req.body;
  const result = createQuestion(name,approvalTreshold,answers);
  res.json(result);
});

app.put('/updateQuestion', (req, res) => {
  const { name,approvalTreshold,answers } = req.body;
  const result = updateQuestion(name,approvalTreshold,answers);
  res.json(result);
});

app.delete('/deleteQuestion', (req, res) => {
  const { name } = req.body;
  const result = deleteQuestion(name);
  res.json(result);
});

app.delete('/deleteLesson', (req, res) => {
  const { course, lessons,  } = req.body;
  const result = deleteLesson(course, lessons,  req.body);
  res.json(result);
});

app.delete('/deleteCourse', (req, res) => {
  const { course  } = req.body;
  const result = deleteCourse(course);
  res.json(result);
});

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});


const getStudentsInfo = () => {
  const studentsJSON = fs.readFileSync('data/students.json', 'utf8');
  return studentsJSON;
}

const constructCourseDataJson = () => {
  try {
    let coursesJSON = JSON.parse(fs.readFileSync("./data/courses.json", 'utf8'));
    let studentsJSON = JSON.parse(fs.readFileSync('data/students.json', 'utf8'));
    studentsJSON = studentsJSON.students;
    let newJson = coursesJSON.courses;

    for (let index = 0; index < newJson.length; index++) {
      const { course, lessons } = newJson[index];
      newJson[index].students = [];


      for (let k = 0; k < studentsJSON.length; k++) {
        const { name, courses } = studentsJSON[k];
        const courseStudentIndex = courses.findIndex(x => x.course === course);
        if (courseStudentIndex != -1) newJson[index].students.push(name);

      }


    }

    return newJson;
  } catch (error) {
    console.error(error);
    return error;
  }


}

const constructLessonsDataJson = (course) => {
  try {
    let courses = JSON.parse(fs.readFileSync("./data/courses.json", 'utf8'));
    let studentsJSON = JSON.parse(fs.readFileSync('data/students.json', 'utf8'));
    studentsJSON = studentsJSON.students;
    courses = courses.courses;
    const courseVli = courses.findIndex(element => element.course === course);
    if (courseVli == -1) throw "The course " + course + " doesn't exist."
    let lessonsArray = courses[courseVli].lessons;
    let newJson = [];
    for (let index = 0; index < lessonsArray.length; index++) {
      const element = lessonsArray[index];
      newJson.push({
        lesson: element,
        students: []
      })
      // for (let k = 0; k < studentsJSON.length; k++) {
      //   const { name, lesson } = studentsJSON[k];
      //   if (lesson === element) newJson[index].students.push(name);

      // }

      for (let k = 0; k < studentsJSON.length; k++) {
        const { name, courses } = studentsJSON[k];
        const courseStudentIndex = courses.findIndex(x => x.course === course);
        if (courseStudentIndex != -1) {

          const lessonIndex = courses[courseStudentIndex].lessons.findIndex(x => x === element);
          if (lessonIndex != -1) newJson[index].students.push(name);
        }

      }


    }
    return newJson;
  } catch (error) {
    console.error(error);
    return error;
  }


}

const getAnswers = (lesson) => {
  let answersJSON = JSON.parse(fs.readFileSync('data/answers_lesson.json', 'utf8'));
  answersJSON = answersJSON.lesson;
  const lessonIndex = answersJSON.findIndex(element => element.name === lesson);
  if (lessonIndex == -1) throw "The lesson " + lesson + " doesn't exist."
  let answerData = answersJSON[lessonIndex];
  return answerData;
}

const evaluateLesson = (name, answers, studentname, coursename) => {
  try {
    let answersJSON = getAnswers(name);
    let score = 0, lessonStudentScore;
    const approvalTreshold = answersJSON.approvalTreshold;
    answersJSON = answersJSON.answers;

    const onlyOneAnswer = 1;
    const moreThanOneAnswer = 2;
    const mustMultipleAnswer = 3;
    for (let index = 0; index < answersJSON.length; index++) {
      const element = answersJSON[index];
      const studentAnswer = answers[index];
      for (const property in element) {
        const correctAnswer = element[property].answer;
        const correctScore = element[property].score;
        const typeQuestion = element[property].answerType;

        for (const key in studentAnswer) {

          if (key === property) {
            let studentA = studentAnswer[key].answer;

            if ((typeQuestion == onlyOneAnswer || typeQuestion == mustMultipleAnswer) && studentA.toString() == correctAnswer.toString()) {
              score += Number(correctScore);
            }

            if (typeQuestion == moreThanOneAnswer) {
              studentA = studentA.toString();
              let splitAnswer = studentA.split(",");
              for (let k = 0; k < splitAnswer.length; k++) {
                if (correctAnswer.includes(splitAnswer[k])) {
                  score += Number(correctScore);
                  break;
                }

              }

            }
          }
        }

      }
    }

    const result = Number(score) >= Number(approvalTreshold) ? "Approved" : "Failed";

    const saveStudentScore = () => {
      let studentsScores = JSON.parse(fs.readFileSync('./data/students_scores.json', 'utf8'));
      let studentsScore = studentsScores.scores;
      const studentIndex = studentsScore.findIndex(x => x.student === studentname);
      if (studentIndex != -1) {
        lessonStudentScore = studentsScore[studentIndex].lessons;
        const lessonIndex = lessonStudentScore.findIndex(x => x.lesson == name);
        if (lessonIndex != -1) {
          studentsScores.scores[studentIndex].lessons[lessonIndex] = {
            lesson: name,
            score: score,
            result: result,
            answers: answers,

          }
        } else {
          studentsScores.scores[studentIndex].lessons.push({
            lesson: name,
            score: score,
            result: result,
            answers: answers,
          })
        }
      } else {
        studentsScores.scores.push({
          student: studentname,
          lessons: [
            {
              lesson: name,
              score: score,
              result: result,
              answers: answers,

            }
          ]
        })
      }

      studentsScores = JSON.stringify(studentsScores);
      fs.writeFileSync('./data/students_scores.json', studentsScores);
    }


    saveStudentScore();

    return { score: score, result: result };
  } catch (error) {
    return "Something is bad..."
  }


}



const createCourse = (course, lessons, req) => {
  try {
    const resultValidate = validateData("course", req);
    if (!resultValidate) throw "You must fill all fields."

    const cJSON = {
      "course": course,
      "lessons": lessons
    }

    let jsonData = JSON.parse(fs.readFileSync('./data/courses.json', 'utf8'));
    jsonData.courses.push(cJSON);
    jsonData = JSON.stringify(jsonData);
    fs.writeFileSync('./data/courses.json', jsonData);
    return "Course created."
  } catch (error) {
    return error
  }


}

const updateCourse = (course, lessons, req) => {
  try {
    const resultValidate = validateData("course", req);
    if (!resultValidate) throw "You must fill all fields."

    const cJSON = {
      "course": course,
      "lessons": lessons
    }

    let jsonData = JSON.parse(fs.readFileSync('./data/courses.json', 'utf8'));
    const courseIndex = jsonData.courses.findIndex(x => x.course === course);
    if (courseIndex == -1) { throw "The course doesn't exist." } else {
      jsonData.courses[courseIndex] = cJSON;
      jsonData = JSON.stringify(jsonData);
      fs.writeFileSync('./data/courses.json', jsonData);
    }

    return "Course updated."
  } catch (error) {
    return error
  }

}

const createQuestion = (name,approvalTreshold,answers) => {
  try {

    const cJSON = {
      "name": name,
      "approvalTreshold": approvalTreshold,
      "answers": answers
    }

    let jsonData = JSON.parse(fs.readFileSync('./data/answers_lesson.json', 'utf8'));
    jsonData.lesson.push(cJSON);
    jsonData = JSON.stringify(jsonData);
    fs.writeFileSync('./data/answers_lesson.json', jsonData);
    return "Questions created."
  } catch (error) {
    return error
  }


}

const updateQuestion = (name,approvalTreshold,answers) => {
  try {

    const cJSON = {
      "name": name,
      "approvalTreshold": approvalTreshold,
      "answers": answers
    }

    let jsonData = JSON.parse(fs.readFileSync('./data/answers_lesson.json', 'utf8'));
    const lIndex = jsonData.lesson.findIndex(x => x.name === name);
    if (lIndex == -1) { throw "The lesson doesn't exist." } else {
      jsonData.lesson[lIndex] = cJSON;
      jsonData = JSON.stringify(jsonData);
      fs.writeFileSync('./data/answers_lesson.json', jsonData);
    }

    return "Question updated."
  } catch (error) {
    return error
  }

}


const createLesson = (course, lesson, req) => {
  try {
    const resultValidate = validateData("course", req);
    if (!resultValidate) throw "You must fill all fields."

    let jsonData = JSON.parse(fs.readFileSync('./data/courses.json', 'utf8'));
    const courseIndex = jsonData.courses.findIndex(x => x.course === course);
    if (courseIndex == -1) { throw "The course doesn't exist." } else {
      jsonData.courses[courseIndex].lessons.push(lesson)
      jsonData = JSON.stringify(jsonData);
      fs.writeFileSync('./data/courses.json', jsonData);
    }

    return "Course updated."
  } catch (error) {
    return error
  }

}

const updateLesson = (course, lesson, newLesson, req) => {
  try {
    const resultValidate = validateData("course", req);
    if (!resultValidate) throw "You must fill all fields."

    let jsonData = JSON.parse(fs.readFileSync('./data/courses.json', 'utf8'));
    const courseIndex = jsonData.courses.findIndex(x => x.course === course);
    if (courseIndex == -1) { throw "The course doesn't exist." }
    else {
      const lessonIndex = jsonData.courses[courseIndex].lessons.findIndex(x => x === lesson);
      if (lessonIndex == -1) {
        throw "The lesson doesn't exist."
      } else {
        jsonData.courses[courseIndex].lessons[lessonIndex] = newLesson;
        jsonData = JSON.stringify(jsonData);
        fs.writeFileSync('./data/courses.json', jsonData);
      }

    }

    return "Course updated."
  } catch (error) {
    return error
  }

}

const deleteLesson = (course, lesson, req) => {
  try {
    const resultValidate = validateData("course", req);
    if (!resultValidate) throw "You must fill all fields."

    let jsonData = JSON.parse(fs.readFileSync('./data/courses.json', 'utf8'));
    const courseIndex = jsonData.courses.findIndex(x => x.course === course);
    if (courseIndex == -1) { throw "The course doesn't exist." }
    else {
      const lessonIndex = jsonData.courses[courseIndex].lessons.findIndex(x => x === lesson);
      if (lessonIndex == -1) {
        throw "The lesson doesn't exist."
      } else {
        jsonData.courses[courseIndex].lessons.splice(lessonIndex,1)
        jsonData = JSON.stringify(jsonData);
        fs.writeFileSync('./data/courses.json', jsonData);
      }

    }

    return "Course updated."
  } catch (error) {
    return error
  }

}

const deleteCourse = (course) => {
  try {
    
    if (!course) throw "You must fill all fields."


    let jsonData = JSON.parse(fs.readFileSync('./data/courses.json', 'utf8'));
    const courseIndex = jsonData.courses.findIndex(x => x.course === course);
    if (courseIndex == -1) { throw "The course doesn't exist." } else {
      jsonData.courses[courseIndex].splice(courseIndex,1);
      jsonData = JSON.stringify(jsonData);
      fs.writeFileSync('./data/courses.json', jsonData);
    }

    return "Course updated."
  } catch (error) {
    return error
  }

}

const deleteQuestion = (name,approvalTreshold,answers) => {
  try {

    let jsonData = JSON.parse(fs.readFileSync('./data/answers_lesson.json', 'utf8'));
    const lIndex = jsonData.lesson.findIndex(x => x.name === name);
    if (lIndex == -1) { throw "The lesson doesn't exist." } else {
      jsonData.lesson.splice(lIndex,1)
      jsonData = JSON.stringify(jsonData);
      fs.writeFileSync('./data/answers_lesson.json', jsonData);
    }

    return "Question updated."
  } catch (error) {
    return error
  }

}

const validateData = (type, req) => {
  if (type === "student") {
    const obligatoryFields = ['name', 'courses'];

    for (let field of obligatoryFields) {
      if (!req.hasOwnProperty(field)) {
        return false;
      }
      if (typeof req[field] === 'string' && req[field].trim() === '') {
        return false;
      }
      if (Array.isArray(req[field]) && req[field].length === 0) {
        return false;
      }
    }

    const { courses } = req;
    for (let index = 0; index < courses.length; index++) {
      const { lessons } = courses[index];
      if (lessons.length === 0) return false;
      if (!courses[index].hasOwnProperty('score')) {
        return false;
      }

    }

    return true;
  }

  if (type === "course") {
    const obligatoryFields = ['course', 'lessons'];

    for (let field of obligatoryFields) {
      if (!req.hasOwnProperty(field)) {
        return false;
      }
      if (typeof req[field] === 'string' && req[field].trim() === '') {
        return false;
      }
      if (Array.isArray(req[field]) && req[field].length === 0) {
        return false;
      }
    }

    if (req.lessons.length === 0) return false;

    return true;
  }

  if (type === "questions") {
    const obligatoryFields = ['name', 'approvalTreshold', 'answers'];

    for (let field of obligatoryFields) {
      if (!req.hasOwnProperty(field)) {
        return false;
      }
      if (typeof req[field] === 'string' && req[field].trim() === '') {
        return false;
      }
      if (Array.isArray(req[field]) && req[field].length === 0) {
        return false;
      }
    }



    return true;
  }

}
