import NodeCache from "node-cache";
import some from "lodash/some";
import isObject from "lodash/isObject";
import _template from "lodash/template";

class JSCacheTags extends NodeCache {
    constructor(options) {
        super(options);

        this.ERRORS["TAGS_TYPE"] = _template("The tags argument has to be an array.");
        this.ERRORS["TTL_TYPE"] =  _template("The ttl argument has to be of type `number`. Found: `<%= type %>`");
        this.ERRORS["TTL_NEGATIVE"] =  _template("The ttl argument cannot be negative.");
        this.ERRORS["TAGS_NOT_FOUND"] = _template("Tags not found.");
    }

    set = (key, value, tags = undefined, ttl, cb) => {
        let valueWithTags = value, error;
        if (tags !== undefined) {
            if (!Array.isArray(tags)) {
                error = this._error("TAGS_TYPE");
                if (cb != undefined && cb !== null) {
                    cb(error);
                }
                return error;
            }

            valueWithTags = {
                value: value,
                tags: tags
            }
        }

        if (ttl) {
            if (!Number.isInteger(ttl) || isNaN(ttl)) {
                error = this._error("TTL_TYPE", {
                    type: typeof key
                });
            }
            if (ttl < 0) {
                error = this._error("TTL_NEGATIVE"); 
            }
            if (cb != undefined && cb !== null) {
                cb(error);
            }
            return error;
        }

        return super.set(key, valueWithTags, ttl, cb);
    };

    get = (key, cb, errorOnMissing = false) => {
        return super.get(key, (err, value) => {
            if (!err && value !== undefined) {
                let valueWithTags;
                if (value.value) {
                    valueWithTags = value.value;
                } else {
                    valueWithTags = value;
                }
                if (cb !== undefined && cb !== null) {
                    cb(undefined, valueWithTags);
                }
                return valueWithTags;
            } else {
                if (cb === undefined && !errorOnMissing) {
                    return undefined;
                }
                else if (cb !== undefined && !errorOnMissing) {
                    cb(err);
                }
                else {
                    throw err;
                }
            }
        }, errorOnMissing);
    };

    getByTags = (tags, cb, errorOnMissing = false) => {
        let values = [], i, tag, len, error;
        if (!Array.isArray(tags)) {
            tags = [tags];
        }
        for (i = 0, len = tags.length; i < len; i++) {
            tag = tags[i];
            let data = this.data;
            for (var key in data) {
                let value = this._unwrap(data[key]);

                if (value.tags) {
                    let found = false;
                    if (isObject(tag)) {
                        found = some(value.tags, tag);
                    } else {
                        found = value.tags.includes(tag);
                    }
                    if (found) {
                        values.push(value.value);
                    }
                }
            }
        }

        if (values.length) {
             if (cb !== undefined) {
                cb(undefined, values);
             }
             return values;
        } else {
            error = this._error("TAGS_NOT_FOUND");
            if (cb === undefined && !errorOnMissing) {
                return values;
            }
            else if (cb !== undefined && !errorOnMissing) {
                cb(error);
                return values;
            }
            else {
                throw error;
            }
        }
    };
  
    delByTags = (tags, cb) => {
        let delCount = 0, i, tag, len;
        if (!Array.isArray(tags)) {
            tags = [tags];
        }
        for (i = 0, len = tags.length; i < len; i++) {
            tag = tags[i];
            let data = this.data;
            for (var key in data) {
                let value = this._unwrap(data[key]);

                if (value.tags) {
                    let found = false;
                    if (isObject(tag)) {
                        found = some(value.tags, tag);
                    } else {
                        found = value.tags.includes(tag);
                    }
                    if (found) {
                        delCount += this.del(key);
                    }
                }
            }
        }
        if (cb != undefined && cb !== null) {
            cb(undefined, delCount);
        }
        return delCount;
    };
}

export default JSCacheTags;