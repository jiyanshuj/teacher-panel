// Mock supabase client for the artifact - replace with your actual import
export const mockSupabase = {
  from: (table: string) => ({
    select: (query: string) => ({
      eq: (column: string, value: string) => ({
        single: () => {
          if (table === 'teachers') {
            return Promise.resolve({
              data: {
                teacher_id: "T001",
                teacher_name: "Dr. Sarah Johnson",
                email: "sarah.johnson@university.edu",
                phone_number: "+1-555-0123",
                department: "Computer Science",
                qualification: "Ph.D in Computer Science",
                experience_years: 8,
                specialization: "Machine Learning, Data Structures"
              },
              error: null
            });
          }
          return Promise.resolve({ data: null, error: { message: "Not found" } });
        }
      }),
      limit: (n: number) => Promise.resolve({
        data: [
          {
            id: 1,
            subject_id: "CS101",
            section: "A",
            semester: 1,
            subjects: {
              subject_name: "Computer Science Fundamentals",
              subject_code: "CS101",
              class_name: "First Year",
              semester: 1
            }
          },
          {
            id: 2,
            subject_id: "CS201",
            section: "B",
            semester: 3,
            subjects: {
              subject_name: "Data Structures and Algorithms",
              subject_code: "CS201",
              class_name: "Second Year",
              semester: 3
            }
          },
          {
            id: 3,
            subject_id: "CS301",
            section: "A",
            semester: 5,
            subjects: {
              subject_name: "Database Management Systems",
              subject_code: "CS301",
              class_name: "Third Year",
              semester: 5
            }
          }
        ],
        error: null
      })
    })
  })
};

export const mockTestConnection = async (): Promise<boolean> => {
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
  return true;
};
