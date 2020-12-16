module.exports =
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ 433:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.handler = void 0;
const handler = () => {
    console.info("invoked!!!");
};
exports.handler = handler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZmlsZTovLy9Vc2Vycy95YW1hbW90b3RhdHN1eWEvUHJvamVjdHMvbmF0dXJlLXJlbW8tbWV0cmljcy9sYW1iZGEvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBRUEsTUFBTSxPQUFPLEdBQXFCLEdBQUcsRUFBRTtJQUNyQyxPQUFPLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQzdCLENBQUMsQ0FBQztBQUVPLDBCQUFPIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgU2NoZWR1bGVkSGFuZGxlciB9IGZyb20gXCJhd3MtbGFtYmRhXCI7XG5cbmNvbnN0IGhhbmRsZXI6IFNjaGVkdWxlZEhhbmRsZXIgPSAoKSA9PiB7XG4gIGNvbnNvbGUuaW5mbyhcImludm9rZWQhISFcIik7XG59O1xuXG5leHBvcnQgeyBoYW5kbGVyIH07XG4iXX0=

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		if(__webpack_module_cache__[moduleId]) {
/******/ 			return __webpack_module_cache__[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete __webpack_module_cache__[moduleId];
/******/ 		}
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat */
/******/ 	
/******/ 	__webpack_require__.ab = __dirname + "/";/************************************************************************/
/******/ 	// module exports must be returned from runtime so entry inlining is disabled
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(433);
/******/ })()
;