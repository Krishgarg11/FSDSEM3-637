const http = require("http");
const fs = require("fs");

const PORT = 3000;
const FILE_NAME = "students.json";

// Create students.json automatically if it does not exist.
if (!fs.existsSync(FILE_NAME)) {
    fs.writeFileSync(FILE_NAME, "[]");
}

function sendHtml(response, statusCode, html) {
    response.writeHead(statusCode, { "Content-Type": "text/html" });
    response.end(html);
}

function readStudents() {
    try {
        return JSON.parse(fs.readFileSync(FILE_NAME, "utf8"));
    } catch (error) {
        return [];
    }
}

function page(title, content) {
    return `<!DOCTYPE html>
<html>
<head>
    <title>${title}</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 0 20px; }
        h1 { color: #1f4f82; }
        form, table { width: 100%; margin-top: 20px; }
        label { display: block; margin-top: 12px; font-weight: bold; }
        input { width: 100%; padding: 8px; margin-top: 5px; box-sizing: border-box; }
        button { margin-top: 18px; padding: 10px 16px; background: #1f4f82; color: white; border: 0; cursor: pointer; }
        table { border-collapse: collapse; }
        th, td { border: 1px solid #bbb; padding: 10px; text-align: left; }
        th { background: #eaf3ff; }
        a { color: #1f4f82; }
    </style>
</head>
<body>
    ${content}
</body>
</html>`;
}

function homePage() {
    return page("Student Record", `
        <h1>Welcome to Student Record Manager</h1>
        <p>Add a student using the form below.</p>
        <form method="POST" action="/add-student">
            <label>Student Name</label>
            <input type="text" name="name" required>

            <label>Roll Number</label>
            <input type="text" name="rollNumber" required>

            <label>Course</label>
            <input type="text" name="course" required>

            <label>Email</label>
            <input type="email" name="email" required>

            <button type="submit">Add Student</button>
        </form>
        <p><a href="/students">View All Students</a></p>
    `);
}

function studentsPage() {
    const students = readStudents();
    let rows = "";

    students.forEach((student, index) => {
        rows += `<tr>
            <td>${index + 1}</td>
            <td>${student.name}</td>
            <td>${student.rollNumber}</td>
            <td>${student.course}</td>
            <td>${student.email}</td>
        </tr>`;
    });

    if (rows === "") {
        rows = '<tr><td colspan="5">No student records found.</td></tr>';
    }

    return page("All Students", `
        <h1>Student Records</h1>
        <table>
            <tr>
                <th>S.No.</th>
                <th>Name</th>
                <th>Roll Number</th>
                <th>Course</th>
                <th>Email</th>
            </tr>
            ${rows}
        </table>
        <p><a href="/">Add Another Student</a></p>
    `);
}

const server = http.createServer((request, response) => {
    if (request.method === "GET" && request.url === "/") {
        sendHtml(response, 200, homePage());
    } else if (request.method === "GET" && request.url === "/students") {
        sendHtml(response, 200, studentsPage());
    } else if (request.method === "POST" && request.url === "/add-student") {
        let body = "";

        request.on("data", (chunk) => {
            body += chunk;
        });

        request.on("end", () => {
            try {
                const formData = new URLSearchParams(body);
                const student = {
                    name: formData.get("name"),
                    rollNumber: formData.get("rollNumber"),
                    course: formData.get("course"),
                    email: formData.get("email")
                };

                if (!student.name || !student.rollNumber || !student.course || !student.email) {
                    sendHtml(response, 400, page("Error", "<h1>All fields are required.</h1><a href='/'>Go Back</a>"));
                    return;
                }

                const students = readStudents();
                students.push(student);
                fs.writeFileSync(FILE_NAME, JSON.stringify(students, null, 2));

                response.writeHead(302, { Location: "/students" });
                response.end();
            } catch (error) {
                sendHtml(response, 500, page("Error", "<h1>Could not save student data.</h1>"));
            }
        });
    } else {
        sendHtml(response, 404, page("404 Not Found", "<h1>404 - Page Not Found</h1><a href='/'>Go Home</a>"));
    }
});

server.listen(PORT, () => {
    console.log(`Student Record server running at http://localhost:${PORT}`);
});
