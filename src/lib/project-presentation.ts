import type { ProjectType } from '@/types/projectType';

export const projectOrder = [
  'nextjs-blog',
  'sharepetment',
  'mbtmi',
  'solo-project',
  'swifty',
] as const;

type Focus = { title: string; description: string };

type ProjectPresentation = {
  summary: string;
  overview: string;
  focus: [Focus, Focus, Focus];
  artwork: string;
};

const presentations: Record<string, ProjectPresentation> = {
  'nextjs-blog': {
    summary:
      'Next.js를 기반으로 개발 글을 직접 발행하고 읽는 블로그. 글 관리, SEO, 조회수까지 운영하며 고친 기록을 남겼습니다.',
    overview:
      '노션에 적어둔 개발 기록을 더 일관된 형태로 다듬고 공유하고 싶었습니다. 블로그를 직접 만들며 글 관리부터 배포, 검색 노출까지 다뤄 보기로 했습니다. 기술을 배우는 과정과 결과를 같은 공간에 남겼습니다.',
    focus: [
      {
        title: '콘텐츠 구조',
        description: 'Markdown과 MDX로 글을 관리하는 방식을 정리했습니다.',
      },
      {
        title: '읽는 경험',
        description: '글의 구성과 다크 모드까지 읽는 화면을 다듬었습니다.',
      },
      {
        title: '운영과 개선',
        description: 'SEO, 분석, 조회수 기능을 단계적으로 더했습니다.',
      },
    ],
    artwork: 'BLOG / FIELD NOTES',
  },
  sharepetment: {
    summary: '반려동물의 일상을 공유하고 산책 친구를 찾는 서비스.',
    overview:
      '반려동물의 일상을 함께 나누고 산책할 친구를 찾는 서비스를 만들었습니다. 프로젝트 기록에는 화면을 구현하고 사용 흐름을 다듬으면서 마주한 문제와 해결 과정을 담았습니다.',
    focus: [
      {
        title: '일상 공유',
        description: '반려동물의 소식을 나누는 화면을 만들었습니다.',
      },
      {
        title: '산책 연결',
        description: '산책 친구를 찾는 흐름을 구현했습니다.',
      },
      {
        title: '사용성 개선',
        description: '구현 과정의 문제와 개선 내용을 기록했습니다.',
      },
    ],
    artwork: 'PET SOCIAL',
  },
  mbtmi: {
    summary: 'O/X 선택지를 넘어 대화형 경험으로 만드는 MBTI 웹 앱.',
    overview:
      '기존 O/X 선택형 테스트에서 벗어나 대화하듯 질문에 답하는 MBTI 웹 앱을 만들었습니다. 질문을 읽고 결과를 확인하는 경험을 중심으로 개발 과정을 정리했습니다.',
    focus: [
      {
        title: '대화형 질문',
        description: '문답이 이어지는 인터페이스를 구성했습니다.',
      },
      {
        title: '결과 경험',
        description: '유형 결과까지 이어지는 흐름을 만들었습니다.',
      },
      {
        title: '개발 기록',
        description: '선택한 기술과 구현 과정을 글로 남겼습니다.',
      },
    ],
    artwork: 'CONVERSATION',
  },
  'solo-project': {
    summary: '북마크 기능이 있는 상품 목록을 구현한 개인 프로젝트.',
    overview:
      '상품을 둘러보고 마음에 드는 항목을 북마크할 수 있는 목록 페이지를 만들었습니다. React 기반 화면과 상태 관리에 관한 구현 과정을 프로젝트 기록에서 살펴볼 수 있습니다.',
    focus: [
      {
        title: '상품 목록',
        description: '상품을 살펴보는 페이지를 구성했습니다.',
      },
      {
        title: '북마크',
        description: '관심 있는 상품을 저장하는 기능을 구현했습니다.',
      },
      { title: '상태 관리', description: '목록과 북마크 상태를 연결했습니다.' },
    ],
    artwork: 'PRODUCT LIST',
  },
  swifty: {
    summary: '학습용 뱅킹 앱에서 대학 축제 티켓팅까지 확장한 프로젝트.',
    overview:
      '학습용 뱅킹 앱으로 시작해 대학 축제 티켓팅을 지원하는 프로젝트로 발전했습니다. 달라진 목표와 그에 맞춰 바꾼 구현 방향을 기록했습니다.',
    focus: [
      {
        title: '학습과 시작',
        description: '뱅킹 앱을 만들며 기본 흐름을 익혔습니다.',
      },
      {
        title: '방향 전환',
        description: '축제 티켓팅이라는 새 목표로 확장했습니다.',
      },
      {
        title: '작업 기록',
        description: '변화한 요구에 맞춘 개발 과정을 남겼습니다.',
      },
    ],
    artwork: 'FESTIVAL',
  },
};

export const stackLabels: Record<ProjectType['stack'][number], string> = {
  react: 'React',
  typescript: 'TypeScript',
  vite: 'Vite',
  styledComponents: 'Styled Components',
  reactQuery: 'React Query',
  reactRouter: 'React Router',
  reactHookForm: 'React Hook Form',
  redux: 'Redux',
  tailwindcss: 'Tailwind CSS',
  eslint: 'ESLint',
  nextJs: 'Next.js',
  contentlayer: 'Contentlayer',
  mdx: 'MDX',
  vercel: 'Vercel',
  netlify: 'Netlify',
};

export function getProjectPresentation(project: ProjectType) {
  return presentations[project.link];
}
