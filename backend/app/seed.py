# Contested sample seed dataset with 12 campus locations, 11 scarce resources, and 15 requests.
# Specially constructed to force preemption (high prio exams arriving after low prio clubs),
# naive FCFS room misallocation (taking first matching room causing huge capacity waste),
# and clearly demonstrate Greedy vs Naive FCFS superiority across all metrics.

SEED_NODES = [
    {"id": "MAIN_GATE", "name": "Main Gate"},
    {"id": "ADMIN_BLDG", "name": "Administration Building"},
    {"id": "ENG_BLOCK_A", "name": "Engineering Block A"},
    {"id": "ENG_BLOCK_B", "name": "Engineering Block B"},
    {"id": "SCI_COMPLEX", "name": "Science Complex"},
    {"id": "LIBRARY", "name": "Central Library"},
    {"id": "STUDENT_CENTER", "name": "Student Activity Center"},
    {"id": "AUDITORIUM", "name": "Main Auditorium"},
    {"id": "SPORTS_COMPLEX", "name": "Sports Complex"},
    {"id": "HOSTEL_NORTH", "name": "North Hostel Block"},
    {"id": "HOSTEL_SOUTH", "name": "South Hostel Block"},
    {"id": "RESEARCH_PARK", "name": "Research & Tech Park"}
]

SEED_EDGES = [
    {"u": "MAIN_GATE", "v": "ADMIN_BLDG", "weight": 120},
    {"u": "MAIN_GATE", "v": "STUDENT_CENTER", "weight": 180},
    {"u": "ADMIN_BLDG", "v": "ENG_BLOCK_A", "weight": 150},
    {"u": "ADMIN_BLDG", "v": "LIBRARY", "weight": 100},
    {"u": "ENG_BLOCK_A", "v": "ENG_BLOCK_B", "weight": 80},
    {"u": "ENG_BLOCK_A", "v": "SCI_COMPLEX", "weight": 200},
    {"u": "ENG_BLOCK_B", "v": "RESEARCH_PARK", "weight": 140},
    {"u": "SCI_COMPLEX", "v": "LIBRARY", "weight": 160},
    {"u": "SCI_COMPLEX", "v": "RESEARCH_PARK", "weight": 190},
    {"u": "LIBRARY", "v": "STUDENT_CENTER", "weight": 110},
    {"u": "STUDENT_CENTER", "v": "AUDITORIUM", "weight": 130},
    {"u": "STUDENT_CENTER", "v": "SPORTS_COMPLEX", "weight": 250},
    {"u": "AUDITORIUM", "v": "HOSTEL_SOUTH", "weight": 170},
    {"u": "HOSTEL_NORTH", "v": "HOSTEL_SOUTH", "weight": 300},
    {"u": "HOSTEL_NORTH", "v": "ENG_BLOCK_B", "weight": 220},
    {"u": "SPORTS_COMPLEX", "v": "HOSTEL_SOUTH", "weight": 210},
    {"u": "RESEARCH_PARK", "v": "HOSTEL_NORTH", "weight": 160}
]

# Scarce resource list (ordered so FCFS first-match behavior is naive)
SEED_RESOURCES = [
    {"id": "RES_CR_101", "name": "Lecture Hall 101", "type": "classroom", "capacity": 60, "building": "ENG_BLOCK_A"},
    {"id": "RES_CR_102", "name": "Classroom 102", "type": "classroom", "capacity": 40, "building": "ENG_BLOCK_B"},
    {"id": "RES_CR_201", "name": "Seminar Classroom 201", "type": "classroom", "capacity": 100, "building": "SCI_COMPLEX"},

    {"id": "RES_LAB_AI", "name": "AI & Robotics Lab", "type": "lab", "capacity": 30, "building": "ENG_BLOCK_B"},
    {"id": "RES_LAB_CHEM", "name": "Advanced Chemistry Lab", "type": "lab", "capacity": 25, "building": "SCI_COMPLEX"},
    {"id": "RES_LAB_NET", "name": "Cyber Security Lab", "type": "lab", "capacity": 50, "building": "RESEARCH_PARK"},

    {"id": "RES_HALL_AUD", "name": "Grand Auditorium", "type": "seminar_hall", "capacity": 400, "building": "AUDITORIUM"},
    {"id": "RES_HALL_CONF", "name": "Senate Hall", "type": "seminar_hall", "capacity": 80, "building": "ADMIN_BLDG"},
    {"id": "RES_HALL_SAC", "name": "SAC Hall", "type": "seminar_hall", "capacity": 150, "building": "STUDENT_CENTER"},

    {"id": "RES_EQ_PROJ_1", "name": "4K Projector Kit", "type": "equipment", "capacity": 1, "building": "LIBRARY"},
    {"id": "RES_EQ_AV", "name": "Mobile AV Sound System", "type": "equipment", "capacity": 1, "building": "STUDENT_CENTER"}
]

SEED_REQUESTS = [
    # --- MONDAY 9-11 CONTESTED CLASSROOMS & PREEMPTION CASE 1 ---
    # REQ_001: Low-priority Club submitted EARLIER (sub_time=1)
    {
        "id": "REQ_001",
        "requester": "Gaming & Esport Club",
        "type": "club_activity",
        "required_capacity": 35,
        "resource_type": "classroom",
        "location": "HOSTEL_NORTH",
        "day": "Monday",
        "start_slot": 9,
        "end_slot": 11,
        "submission_time": 1
    },
    # REQ_002: Club submitted EARLIER (sub_time=2)
    {
        "id": "REQ_002",
        "requester": "Robotics Club Meet",
        "type": "club_activity",
        "required_capacity": 50,
        "resource_type": "classroom",
        "location": "ENG_BLOCK_B",
        "day": "Monday",
        "start_slot": 9,
        "end_slot": 11,
        "submission_time": 2
    },
    # REQ_003: Club submitted EARLIER (sub_time=3)
    {
        "id": "REQ_003",
        "requester": "Drama Society Rehearsal",
        "type": "club_activity",
        "required_capacity": 85,
        "resource_type": "classroom",
        "location": "SCI_COMPLEX",
        "day": "Monday",
        "start_slot": 9,
        "end_slot": 11,
        "submission_time": 3
    },
    # REQ_004: High-priority EXAM submitted LATER (sub_time=14) requesting classroom at Monday 9-11
    # Needs cap 55. Preempts REQ_002 (Robotics Club, cap 50 holding RES_CR_101 cap 60)!
    {
        "id": "REQ_004",
        "requester": "Dean of Engineering (Final Exam)",
        "type": "exam",
        "required_capacity": 55,
        "resource_type": "classroom",
        "location": "ENG_BLOCK_A",
        "day": "Monday",
        "start_slot": 9,
        "end_slot": 11,
        "submission_time": 14
    },

    # --- TUESDAY 14-16 CONTESTED LABS & PREEMPTION CASE 2 ---
    # REQ_005: Low-priority Club submitted EARLIER (sub_time=4)
    {
        "id": "REQ_005",
        "requester": "Anime Society Meet",
        "type": "club_activity",
        "required_capacity": 22,
        "resource_type": "lab",
        "location": "STUDENT_CENTER",
        "day": "Tuesday",
        "start_slot": 14,
        "end_slot": 16,
        "submission_time": 4
    },
    # REQ_006: Club submitted EARLIER (sub_time=5)
    {
        "id": "REQ_006",
        "requester": "Coding Club Hackathon",
        "type": "club_activity",
        "required_capacity": 28,
        "resource_type": "lab",
        "location": "ENG_BLOCK_B",
        "day": "Tuesday",
        "start_slot": 14,
        "end_slot": 16,
        "submission_time": 5
    },
    # REQ_007: Club submitted EARLIER (sub_time=6)
    {
        "id": "REQ_007",
        "requester": "Gaming Guild Tournament",
        "type": "club_activity",
        "required_capacity": 45,
        "resource_type": "lab",
        "location": "RESEARCH_PARK",
        "day": "Tuesday",
        "start_slot": 14,
        "end_slot": 16,
        "submission_time": 6
    },
    # REQ_008: High-priority EXAM submitted LATER (sub_time=15) requesting lab at Tuesday 14-16
    # Needs cap 28. Preempts REQ_006 (Coding Club, cap 28 holding RES_LAB_AI cap 30)!
    {
        "id": "REQ_008",
        "requester": "Prof. Alan Turing (AI Lab Exam)",
        "type": "exam",
        "required_capacity": 28,
        "resource_type": "lab",
        "location": "ENG_BLOCK_B",
        "day": "Tuesday",
        "start_slot": 14,
        "end_slot": 16,
        "submission_time": 15
    },

    # --- WEDNESDAY 14-16 NAIVE FCFS WASTAGE & CONTESTATION ---
    # REQ_009: Chess Club (cap 20). FCFS blindly grabs Grand Auditorium (cap 400), wasting 380 seats!
    # Greedy picks Senate Hall (cap 80, best fit).
    {
        "id": "REQ_009",
        "requester": "Chess Club Practice",
        "type": "club_activity",
        "required_capacity": 20,
        "resource_type": "seminar_hall",
        "location": "HOSTEL_SOUTH",
        "day": "Wednesday",
        "start_slot": 14,
        "end_slot": 16,
        "submission_time": 7
    },
    # REQ_010: Mega Tech Conference (cap 350). Needs Grand Auditorium.
    # In FCFS, Grand Auditorium is occupied by Chess Club! FCFS fails!
    # In Greedy, Grand Auditorium is free! Greedy allocates!
    {
        "id": "REQ_010",
        "requester": "Mega Tech Annual Conference",
        "type": "event",
        "required_capacity": 350,
        "resource_type": "seminar_hall",
        "location": "ADMIN_BLDG",
        "day": "Wednesday",
        "start_slot": 14,
        "end_slot": 16,
        "submission_time": 16
    },

    # --- ADDITIONAL REGULAR CLASSES & OVERCAPACITY SCENARIO ---
    {
        "id": "REQ_011",
        "requester": "Chemistry Practical Class",
        "type": "regular_class",
        "required_capacity": 20,
        "resource_type": "lab",
        "location": "SCI_COMPLEX",
        "day": "Thursday",
        "start_slot": 9,
        "end_slot": 11,
        "submission_time": 8
    },
    {
        "id": "REQ_012",
        "requester": "Cyber Security Lecture",
        "type": "regular_class",
        "required_capacity": 40,
        "resource_type": "lab",
        "location": "RESEARCH_PARK",
        "day": "Thursday",
        "start_slot": 9,
        "end_slot": 11,
        "submission_time": 9
    },
    {
        "id": "REQ_013",
        "requester": "Cultural Fest Sound Tech",
        "type": "event",
        "required_capacity": 1,
        "resource_type": "equipment",
        "location": "STUDENT_CENTER",
        "day": "Friday",
        "start_slot": 14,
        "end_slot": 18,
        "submission_time": 10
    },
    {
        "id": "REQ_014",
        "requester": "VR Lab Research",
        "type": "regular_class",
        "required_capacity": 1,
        "resource_type": "equipment",
        "location": "LIBRARY",
        "day": "Friday",
        "start_slot": 10,
        "end_slot": 12,
        "submission_time": 11
    },
    {
        "id": "REQ_015",
        "requester": "Global Campus Summit",
        "type": "event",
        "required_capacity": 800,
        "resource_type": "seminar_hall",
        "location": "ADMIN_BLDG",
        "day": "Friday",
        "start_slot": 9,
        "end_slot": 13,
        "submission_time": 12
    }
]
