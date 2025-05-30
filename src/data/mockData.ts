
export interface Course {
  id: string;
  title: string;
  description: string;
  category: 'Beginner' | 'Average' | 'Advanced';
  difficulty: 'Beginner' | 'Average' | 'Advanced'; // Added difficulty property
  thumbnail: string;
  instructor: string;
  duration: string;
  price: number; // Added price property
  rating: number; // Added rating property
  enrollmentCount: number;
  modules: Module[];
}

export interface Module {
  id: string;
  title: string;
  description: string; // Added description property
  videos: Video[];
}

export interface Video {
  id: string;
  title: string;
  youtubeUrl: string;
  duration: string;
  completed?: boolean;
}

export const mockCourses: Course[] = [
  {
    id: '1',
    title: 'React Fundamentals',
    description: 'Learn the basics of React including components, state, and props.',
    category: 'Beginner',
    difficulty: 'Beginner',
    thumbnail: '/placeholder.svg',
    instructor: 'Sanjana',
    duration: '4 hours',
    price: 49,
    rating: 4.8,
    enrollmentCount: 1250,
    modules: [
      {
        id: '1',
        title: 'Introduction to React',
        description: 'Get started with React basics and concepts',
        videos: [
          {
            id: '1',
            title: 'What is React?',
            youtubeUrl: 'https://www.youtube.com/embed/dGcsHMXbSOA',
            duration: '10:30'
          },
          {
            id: '2',
            title: 'Setting up React',
            youtubeUrl: 'https://www.youtube.com/embed/SqcY0GlETPk',
            duration: '15:45'
          }
        ]
      },
      {
        id: '2',
        title: 'Components and Props',
        description: 'Learn how to create and use React components',
        videos: [
          {
            id: '3',
            title: 'Creating Components',
            youtubeUrl: 'https://www.youtube.com/embed/Y2hgEGPzTZY',
            duration: '12:20'
          },
          {
            id: '4',
            title: 'Understanding Props',
            youtubeUrl: 'https://www.youtube.com/embed/PHaECbrKgs0',
            duration: '18:10'
          }
        ]
      }
    ]
  },
  {
    id: '2',
    title: 'Advanced JavaScript',
    description: 'Master advanced JavaScript concepts including closures, async/await, and more.',
    category: 'Advanced',
    difficulty: 'Advanced',
    thumbnail: '/placeholder.svg',
    instructor: 'Raju',
    duration: '6 hours',
    price: 79,
    rating: 4.7,
    enrollmentCount: 890,
    modules: [
      {
        id: '3',
        title: 'Closures and Scope',
        description: 'Deep dive into JavaScript closures and scope',
        videos: [
          {
            id: '5',
            title: 'Understanding Closures',
            youtubeUrl: 'https://www.youtube.com/embed/3a0I8ICR1Vg',
            duration: '22:15'
          }
        ]
      }
    ]
  },
  {
    id: '3',
    title: 'CSS Grid and Flexbox',
    description: 'Learn modern CSS layout techniques with Grid and Flexbox.',
    category: 'Average',
    difficulty: 'Average',
    thumbnail: '/placeholder.svg',
    instructor: 'ravi',
    duration: '3 hours',
    price: 39,
    rating: 4.5,
    enrollmentCount: 567,
    modules: [
      {
        id: '4',
        title: 'CSS Grid Basics',
        description: 'Introduction to CSS Grid layout system',
        videos: [
          {
            id: '6',
            title: 'Introduction to CSS Grid',
            youtubeUrl: 'https://www.youtube.com/embed/jV8B24rSN5o',
            duration: '16:30'
          }
        ]
      }
    ]
  }
];

export const mockEnrollments = ['1', '3']; // Course IDs the user is enrolled in
export const mockWishlist = ['2']; // Course IDs in user's wishlist
