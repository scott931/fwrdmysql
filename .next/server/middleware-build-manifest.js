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
    "/admin/financial-management": [
      "static/chunks/webpack.js",
      "static/chunks/main.js",
      "static/chunks/pages/admin/financial-management.js"
    ],
    "/admin/upload-course": [
      "static/chunks/webpack.js",
      "static/chunks/main.js",
      "static/chunks/pages/admin/upload-course.js"
    ],
    "/afri-sage": [
      "static/chunks/webpack.js",
      "static/chunks/main.js",
      "static/chunks/pages/afri-sage.js"
    ],
    "/community": [
      "static/chunks/webpack.js",
      "static/chunks/main.js",
      "static/chunks/pages/community.js"
    ],
    "/course/[courseId]/lesson/[lessonId]": [
      "static/chunks/webpack.js",
      "static/chunks/main.js",
      "static/chunks/pages/course/[courseId]/lesson/[lessonId].js"
    ],
    "/home": [
      "static/chunks/webpack.js",
      "static/chunks/main.js",
      "static/chunks/pages/home.js"
    ],
    "/profile": [
      "static/chunks/webpack.js",
      "static/chunks/main.js",
      "static/chunks/pages/profile.js"
    ]
  },
  "ampFirstPages": []
};
self.__BUILD_MANIFEST.lowPriorityFiles = [
"/static/" + process.env.__NEXT_BUILD_ID + "/_buildManifest.js",
,"/static/" + process.env.__NEXT_BUILD_ID + "/_ssgManifest.js",

];