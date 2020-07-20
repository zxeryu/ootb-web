import { stringify } from "querystring";
import { forEach, isArray, isObject, Dictionary, startsWith } from "lodash";

export const getProtocol = () => globalThis.location.protocol;

export const isHttps = () => getProtocol() == "https:";

export const protocolPrefix = (url = "") => {
  if (url.startsWith("http:") || url.startsWith("https:")) {
    return url;
  }
  return getProtocol() + url;
};

export const urlComplete = (baseURLs: Dictionary<string>) => (url = "/") => {
  if (url.startsWith("http:") || url.startsWith("https:")) {
    return url;
  }
  const firstPart = url.split("/")[1];
  return `${protocolPrefix(baseURLs[firstPart])}${url}`;
};

export const baseURLsFromConfig = (config: Dictionary<string>): Dictionary<string> => {
  const baseURLs: Dictionary<string> = {};

  forEach(config, (v, k) => {
    if (startsWith(k, "SRV_")) {
      const basePath = k.replace("SRV_", "").replace(/_/g, "-").toLowerCase();
      baseURLs[basePath] = v;
    }
  });

  return baseURLs;
};

export const isMultipartFormData = (contentType = "") => contentType.includes("multipart/form-data");

export const isFormURLEncoded = (contentType = "") => contentType.includes("application/x-www-form-urlencoded");

export const paramsSerializer = (params: any) => {
  const data = {} as any;

  const add = (k: string, v: string) => {
    if (typeof v === "undefined" || String(v).length === 0) {
      return;
    }

    if (data[k]) {
      data[k] = ([] as string[]).concat(data[k]).concat(v);
      return;
    }

    data[k] = v;
  };

  const appendValue = (k: string, v: any) => {
    if (isArray(v)) {
      forEach(v, (item) => appendValue(k, item));
    } else if (isObject(v)) {
      add(k, JSON.stringify(v));
    } else {
      add(k, v);
    }
  };

  forEach(params, (v, k) => appendValue(k, v));

  return stringify(data);
};

export const transformRequest = (data: any, headers: any) => {
  const contentType = headers["Content-Type"];

  if (isMultipartFormData(contentType)) {
    const formData = new FormData();

    const appendValue = (k: string, v: any) => {
      if (v instanceof File || v instanceof Blob) {
        formData.append(k, v);
      } else if (isArray(v)) {
        forEach(v, (item) => appendValue(k, item));
      } else if (isObject(v)) {
        formData.append(k, JSON.stringify(v));
      } else {
        formData.append(k, v);
      }
    };

    forEach(data, (v, k) => appendValue(k, v));

    return formData;
  }

  if (isFormURLEncoded(contentType)) {
    return paramsSerializer(data);
  }

  if (isArray(data) || isObject(data)) {
    return JSON.stringify(data);
  }

  return data;
};
