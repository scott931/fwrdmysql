self.__BUILD_MANIFEST = {
  "polyfillFiles": [
    "static/chunks/polyfills.js"
  ],
  "devFiles": [
    "static/chunks/react-refresh.js"
  ],
  "ampDevFiles": [],
  "lowPriorityFiles": [],
  "rootMainFiles": [],
  "pages": {
    "/": [
      "static/chunks/webpack.js",
      "static/chunks/main.js",
      "static/chunks/pages/index.js"
    ],
    "/_app": [
      "static/chunks/webpack.js",
      "static/chunks/main.js",
      "static/chunks/pages/_app.js"
    ],
    "/_error": [
      "static/chunks/webpack.js",
      "static/chunks/main.js",
      "static/chunks/pages/_error.js"
    ],
    "/admin": [
      "static/chunks/webpack.js",
      "static/chunks/main.js",
      "static/chunks/pages/admin.js"
    ],
    "/course/[courseId]/lesson/[lessonId]": [
      "static/chunks/webpack.js",
      "static/chunks/main.js",
      "static/chunks/pages/course/[courseId]/lesson/[lessonId].js"
    ],
    "/courses": [
      "static/chunks/webpack.js",
      "static/chunks/main.js",
      "static/chunks/pages/courses.js"
    ],
    "/home": [
      "static/chunks/webpack.js",
      "static/chunks/main.js",
      "static/chunks/pages/home.js"
    ],
    "/instructor/[instructorId]": [
      "static/chunks/webpack.js",
      "static/chunks/main.js",
      "static/chunks/pages/instructor/[instructorId].js"
    ],
    "/login": [
      "static/chunks/webpack.js",
      "static/chunks/main.js",
      "static/chunks/pages/login.js"
    ]
  },
  "ampFirstPages": []
};
self.__BUILD_MANIFEST.lowPriorityFiles = [
"/static/" + process.env.__NEXT_BUILD_ID + "/_buildManifest.js",
,"/static/" + process.env.__NEXT_BUILD_ID + "/_ssgManifest.js",

];