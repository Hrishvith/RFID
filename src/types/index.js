/**
 * @typedef {Object} Student
 * @property {number} id
 * @property {string} name
 * @property {string} usn
 * @property {string} department
 * @property {string} year
 * @property {string} uid
 * @property {string} email
 * @property {string} phone
 * @property {string} phoneNo
 * @property {string} address
 * @property {string|null} photo
 * @property {"Present"|"Absent"} status
 * @property {string} joinedOn
 */

/**
 * @typedef {Object} AttendanceRecord
 * @property {number} id
 * @property {string} date  "DD-MM-YYYY"
 * @property {string} time  "hh:mm AM/PM" or "-"
 * @property {string} uid
 * @property {string} usn
 * @property {string} name
 * @property {string} department
 * @property {"Present"|"Absent"|"Late"} status
 */

/**
 * @typedef {Object} Notification
 * @property {number} id
 * @property {string} title
 * @property {string} message
 * @property {"info"|"success"|"warning"|"error"} type
 * @property {string} time
 * @property {boolean} read
 */

/**
 * @typedef {Object} InstituteSettings
 * @property {string} instituteName
 * @property {string} instituteCode
 * @property {string} semester
 * @property {string} department
 * @property {string} attendanceStartTime
 * @property {string} attendanceEndTime
 * @property {string} lateMarkAfter
 * @property {"light"|"dark"|"system"} theme
 * @property {string} academicYear
 */

export {};
