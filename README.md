## eLearning Api

### Endpoints:
- Students:
  - url: localhost:3000/students
  - description: Get student data

- Courses:
  - url: /courses
  - description: Get courses data

  - url: /course/:name
  - description: Get a specific course data

  - url: /createCourse
  - description: Create a new course.
  - json example: 
{
  "course": "English",
  "lessons": [
  "Grammar",
 "Vocabulary"
   ]
}

  - url: /updateCourse
  - description: Update a course.
  - json example: 
{
  "course": "English",
  "lessons": [
  "Grammar",
 "Speaking"
   ]
}

  - url: /deleteCourse
  - description: Delete a course.
  - json example: 
{
  "course": "English"
}

- Lesson:
  - url: /evaluateLesson
  - method: POST
  - description: Compares the student's answers against the correct answers.
  - json example:
    {
  "student":"Mio",
  "course":"English",
  "lesson": "grammar",
  "answers": [
    {
      "1": {
        "answer": [
          "T"
        ]
      },
      "2": {
        "answer": [
          "C",
          "B"
        ]
      },
      "3": {
        "answer": [
          "C",
          "B",
          "D"
        ]
      }
    }
  ]
}
  - url: /createLesson
  - method: POST
  - description: Create a new lesson.
  - json example: 
 {
   "course": "Art",
    "lessons": "photography"
}

  - url: /updateLesson
  - method: PUT
  - description: Update a lesson.
  - json example: 
 {
  "course": "Art",
  "lessons": "photography",
    "newLesson":"Photography"
}

  - url: /deleteLesson
  - method: delete
  - description: Delete a lesson.
  - json example: 
{
  "lesson": "Grammar"
}

- Questions:
  - url: /answers/:name
  - method: GET
  - description: Gets the answers to the questions of a specific lesson.

  - url: /createQuestion
  - method: POST
  - description: Create new questions for a not yet existing lesson 
  - json example: 
{
            "name": "calc1",
            "approvalTreshold":6,
            "answers": [
                {
                    "1": {
                        "answer":["A"],
                        "answerType":1, //Multiple choice when only one answer is correct
                        "score":2
                    },
                    "2":{
                        "answer":["A","B"],
                        "answerType":2, //Multiple choice when more than one answer is correct
                        "score":4
                    },
                    "3": {
                        "answer":["A","B","D"],
                        "answerType":3, //Multiple choice when more than one answer is correct and all of them must be answered correctly
                        "score":4
                    }
                }
            ]
        }

  - url: /updateQuestion
  - method: PUT
  - description: Update all questions in a lesson
{
            "name": "calc1",
            "approvalTreshold":6,
            "answers": [
                {
                    "1": {
                        "answer":["A"],
                        "answerType":1, //Multiple choice when only one answer is correct
                        "score":2
                    },
                    "2":{
                        "answer":["A","B"],
                        "answerType":2, //Multiple choice when more than one answer is correct
                        "score":4
                    },
                    "3": {
                        "answer":["A","B","D"],
                        "answerType":3, //Multiple choice when more than one answer is correct and all of them must be answered correctly
                        "score":4
                    }
                }
            ]
        }

  - url: /deleteQuestion
  - method: delete
  - description: Delete all questions in a lesson.
  - json example: 
{
  "name": "calc1"
}
