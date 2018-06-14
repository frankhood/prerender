var he = require('he');

module.exports = {
	pageLoaded: (req, res, next) => {
		if (req.prerender.content && req.prerender.renderType == 'html') {
			const headers = {};
			let statusMatch = /<meta[^<>]*(?:name=['"]prerender-status-code['"][^<>]*content=['"]([0-9]{3})['"]|content=['"]([0-9]{3})['"][^<>]*name=['"]prerender-status-code['"])[^<>]*>/i,
				headerMatch = /<meta[^<>]*(?:name=['"]prerender-header['"][^<>]*content=['"]([^'"]*?): ?([^'"]*?)['"]|content=['"]([^'"]*?): ?([^'"]*?)['"][^<>]*name=['"]prerender-header['"])[^<>]*>/gi,
				head = req.prerender.content.toString().split('</head>', 1).pop(),
				statusCode = req.prerender.statusCode,
				match;

			if (match = statusMatch.exec(head)) {
				statusCode = match[1] || match[2];
				req.prerender.content = req.prerender.content.toString().replace(match[0], '');
			}

			while (match = headerMatch.exec(head)) {
				const key = match[1] || match[3];
				const value = he.decode(match[2] || match[4]);
				res.setHeader(key, value);
				req.prerender.content = req.prerender.content.toString().replace(match[0], '');
				headers[key] = value;
			}

			req.prerender.statusCode = statusCode;
			Object.assign(req.prerender.headers, headers);
		}

		next();
	}
};
