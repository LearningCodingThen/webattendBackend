// models/attendance.js
class Attendance {
  constructor(student_id, date, status) {
    this.student_id = student_id; // Foreign key to the students table
    this.date = date; // e.g., '2023-10-27'
    this.status = status; // e.g., 'present', 'absent'
  }
}

module.exports = Attendance;