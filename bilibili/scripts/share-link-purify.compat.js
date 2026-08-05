// BBZQ-style share-link purification for Surge-compatible module runtimes.
(function () {
  var SHORT_LINK_HOSTS = { "b23.tv": true, "bili2233.cn": true };
  var TRAILING_PUNCTUATION = ")]}>.,;:!?，。；：！？、「」（）";
  var BV_TABLE = "FcwAPNKTMug3GV5Lj7EJnHpWsx4tb8haYeviqBz6rkCy12mUSDQX9RdoZf";
  var BV_POSITIONS = [11, 10, 3, 8, 4, 6, 5, 7, 9];

  function parseArguments(raw) {
    if (raw && typeof raw === "object") return raw;
    if (typeof raw !== "string" || !raw) return {};
    var result = {};
    raw.split("&").forEach(function (part) {
      var separator = part.indexOf("=");
      var key = separator === -1 ? part : part.slice(0, separator);
      var value = separator === -1 ? "" : part.slice(separator + 1);
      value = value.replace(/^"|"$/g, "");
      try {
        value = decodeURIComponent(value);
      } catch (_) {}
      result[key] = value;
    });
    return result;
  }

  function enabled(value, fallback) {
    if (value === undefined || value === null || value === "") return fallback;
    return String(value).toLowerCase() === "true";
  }

  function hostOf(url) {
    try {
      return new URL(url).hostname.toLowerCase();
    } catch (_) {
      var match = /^https?:\/\/([^\/:?#]+)/i.exec(url);
      return match ? match[1].toLowerCase() : "";
    }
  }

  function isBilibiliHost(host) {
    return host === "bilibili.com" || /\.bilibili\.com$/.test(host);
  }

  function withoutQueryAndFragment(url) {
    return url.split(/[?#]/, 1)[0];
  }

  function absoluteUrl(location, base) {
    try {
      return new URL(location, base).toString();
    } catch (_) {
      if (/^https?:\/\//i.test(location)) return location;
      var origin = /^(https?:\/\/[^/]+)/i.exec(base);
      if (!origin) return location;
      return origin[1] + (location.charAt(0) === "/" ? location : "/" + location);
    }
  }

  function locationHeader(response) {
    if (!response) return "";
    var headers = response.headers || {};
    var direct = headers.Location || headers.location;
    if (direct) return direct;
    var names = Object.keys(headers);
    for (var i = 0; i < names.length; i += 1) {
      if (names[i].toLowerCase() === "location") return headers[names[i]];
    }
    return "";
  }

  function resolveShortLink(url, callback) {
    if (!SHORT_LINK_HOSTS[hostOf(url)]) {
      callback(url);
      return;
    }
    var requestUrl = withoutQueryAndFragment(url);
    if (typeof $httpClient === "undefined" || !$httpClient.get) {
      callback(requestUrl);
      return;
    }
    $httpClient.get(
      { url: requestUrl, "auto-redirect": false, timeout: 5 },
      function (error, response) {
        if (error) {
          callback(requestUrl);
          return;
        }
        var location = locationHeader(response);
        if (location) {
          callback(absoluteUrl(location, requestUrl));
          return;
        }
        var finalUrl = response && response.url;
        callback(finalUrl && finalUrl !== requestUrl ? finalUrl : requestUrl);
      }
    );
  }

  function bvToAv(bv) {
    if (typeof BigInt === "undefined") return null;
    try {
      var result = BigInt(0);
      var power = BigInt(1);
      for (var i = 0; i < BV_POSITIONS.length; i += 1) {
        var index = BV_TABLE.indexOf(bv.charAt(BV_POSITIONS[i]));
        if (index < 0) return null;
        result += BigInt(index) * power;
        power *= BigInt(58);
      }
      return ((result & BigInt("2251799813685247")) ^ BigInt("23442827791579")).toString();
    } catch (_) {
      return null;
    }
  }

  function transformUrl(url, transformAv) {
    var target;
    try {
      target = new URL(url);
    } catch (_) {
      return url;
    }
    if (!isBilibiliHost(target.hostname.toLowerCase())) return url;

    var segments = target.pathname.split("/");
    if (transformAv) {
      for (var i = 0; i < segments.length; i += 1) {
        if (/^BV[A-Za-z0-9]{10}$/.test(segments[i])) {
          var aid = bvToAv(segments[i]);
          if (aid) segments[i] = "av" + aid;
          break;
        }
      }
    }

    var query = [];
    var p = target.searchParams.get("p");
    var time = target.searchParams.get("t");
    var startProgress = target.searchParams.get("start_progress");
    if (p) query.push("p=" + encodeURIComponent(p));
    if (time) query.push("t=" + encodeURIComponent(time));
    if (startProgress) {
      query.push("start_progress=" + encodeURIComponent(startProgress));
      if (!time && /^-?\d+$/.test(startProgress)) {
        query.push("t=" + String(Math.trunc(Number(startProgress) / 1000)));
      }
    }
    query.push("unique_k=2333");

    target.pathname = segments.join("/");
    target.search = query.join("&");
    target.hash = "";
    return target.toString();
  }

  function purifyLink(url, transformAv, callback) {
    resolveShortLink(url.trim(), function (resolved) {
      callback(transformUrl(resolved, transformAv));
    });
  }

  function splitSuffix(raw) {
    var index = raw.length;
    while (index > 0 && TRAILING_PUNCTUATION.indexOf(raw.charAt(index - 1)) !== -1) {
      index -= 1;
    }
    return [raw.slice(0, index), raw.slice(index)];
  }

  function purifyText(text, transformAv, callback) {
    var matches = [];
    var regex = /https?:\/\/\S+/g;
    var match;
    while ((match = regex.exec(text)) !== null) {
      matches.push({ index: match.index, raw: match[0] });
    }
    if (!matches.length) {
      callback(text);
      return;
    }

    var cursor = 0;
    var output = "";
    function next(position) {
      if (position >= matches.length) {
        callback(output + text.slice(cursor));
        return;
      }
      var item = matches[position];
      var parts = splitSuffix(item.raw);
      output += text.slice(cursor, item.index);
      purifyLink(parts[0], transformAv, function (purified) {
        output += purified + parts[1];
        cursor = item.index + item.raw.length;
        next(position + 1);
      });
    }
    next(0);
  }

  function purifyFields(payload, transformAv, callback) {
    var data = payload && payload.data;
    if (!data || typeof data !== "object") {
      callback(false);
      return;
    }
    var fields = ["link", "content"].filter(function (key) {
      return typeof data[key] === "string" && data[key];
    });
    var changed = false;
    function next(position) {
      if (position >= fields.length) {
        callback(changed);
        return;
      }
      var key = fields[position];
      var original = data[key];
      purifyText(original, transformAv, function (purified) {
        if (purified !== original) {
          data[key] = purified;
          changed = true;
        }
        next(position + 1);
      });
    }
    next(0);
  }

  try {
    var args = parseArguments(typeof $argument === "undefined" ? "" : $argument);
    if (!enabled(args["Share.Purify"], true)) {
      $done({});
      return;
    }
    var payload = JSON.parse($response && $response.body ? $response.body : "{}");
    if (payload.code !== 0) {
      $done({});
      return;
    }
    purifyFields(payload, enabled(args["Share.BV2AV"], false), function (changed) {
      $done(changed ? { body: JSON.stringify(payload) } : {});
    });
  } catch (error) {
    console.log("BiliBili share-link purifier error: " + error);
    $done({});
  }
})();
