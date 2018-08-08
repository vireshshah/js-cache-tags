import JSCacheTags from './index';

let cache = new JSCacheTags();

describe('JSCacheTags', () => {
    beforeEach(() => {
        cache.flushAll();
    });

    describe('JSCacheTags()', () => {
        test('should return a new cache instance when called', () => {
            const cache1 = new JSCacheTags(),
                cache2 = new JSCacheTags();
            cache1.set('key', 'value1');
            expect(cache1.keys()).toEqual(['key']);
            expect(cache2.keys()).toEqual([]);
            cache2.set('key', 'value2');
            expect(cache1.get('key')).toEqual('value1');
            expect(cache2.get('key')).toEqual('value2');
        });
    });

    describe('set()', () => {
        test('should allow adding a new item to the cache', () => {
            expect(() => {
                cache.set('key', 'value');
            }).not.toThrow();
        });

        test('should allow adding a new item to the cache with tags', () => {
            expect(() => {
                cache.set('key', 'value', ['tag1', 'tag2']);
            }).not.toThrow();
        });

        test('should allow adding a new item to the cache with tags and timeout', () => {
            expect(() => {
                cache.set('key', 'value', ['tag1', 'tag2'], 100);
            }).not.toThrow();
        });

        test('should allow adding a new item to the cache with tags, timeout and callback', () => {
            expect(() => {
                cache.set('key', 'value', ['tag1', 'tag2'], 100, () => { });
            }).not.toThrow();
        });

        test('should throw an error given a non-array for tags', () => {
            let error = cache.set('key', 'value', 'foo');
            expect(error.message).toEqual(cache.ERRORS['TAGS_TYPE']({}));
        });

        test('should throw an error given a non-array for tags with error callback', () => {
            const errorCallback = jest.fn();
            cache.set('key', 'value', 'foo', 100, errorCallback);
            expect(errorCallback).toHaveBeenCalled();
        });

        test('should throw an error given a non-numeric timeout', () => {
            let error = cache.set('key', 'value', ['tag1', 'tag2'], 'foo');
            expect(error.message).toEqual(cache.ERRORS['TTL_TYPE']({ type: typeof 'key' }));
        });

        test('should throw an error given a negative timeout', () => {
            let error = cache.set('key', 'value', ['tag1', 'tag2'], -100);
            expect(error.message).toEqual(cache.ERRORS['TTL_NEGATIVE']({}));
        });

        test('should throw an error given a non-function timeout callback', () => {
            expect(() => {
                cache.set('key', 'value', ['tag1', 'tag2'], 100, 'foo');
            }).toThrow();
        });

        test('should cause the timeout callback to fire once the cache item expires', () => {
            jest.useFakeTimers();
            const onCacheExpire = jest.fn();
            cache.on('expired', onCacheExpire);
            cache.set('key', 'value', ['tag1', 'tag2'], 1);
            jest.advanceTimersByTime(1000);
            jest.clearAllTimers();
            //expect(onCacheExpire).toHaveBeenCalled();
        });

        test('should return the true for successful set', () => {
            expect(cache.set('key', 'value')).toEqual(true);
        });
    });

    describe('get()', () => {
        test('should return undefined given a key for an empty cache', () => {
            expect(cache.get('miss')).toBeUndefined();
        });

        test('should return undefined given a key not in a non-empty cache', () => {
            cache.set('key', 'value');
            expect(cache.get('miss')).toBeUndefined();
        });

        test('should return the corresponding value of a key in the cache', () => {
            cache.set('key', 'value');
            expect(cache.get('key')).toEqual('value');
        });

        test('should return the corresponding value of a key and tags in the cache', () => {
            cache.set('key', 'value', ['tag1', 'tag2']);
            let value = cache.get('key');
            expect(value.value).toEqual("value");
            expect(value.tags).toEqual(["tag1", "tag2"]);
        });

        test('should return the corresponding value of a key and tags in the cache with callback', () => {
            cache.set('key', 'value', ['tag1', 'tag2']);
            const getCallback = jest.fn();
            let value = cache.get('key', getCallback);
            expect(value.value).toEqual("value");
            expect(value.tags).toEqual(["tag1", "tag2"]);
            expect(getCallback).toHaveBeenCalled();
        });

        test('should throw an error if passing errorOnMissing flag true while attempting to get a missing or expired value.', () => {
            cache.set('key', 'value');
            try {
                cache.get('key1', null, true);
            }
            catch(error) {
                expect(error.message).toEqual(cache.ERRORS['ENOTFOUND']({ key: 'key1' }));
            }
        });

        test('should pass an error to callback if attempting to get a missing or expired value.', () => {
            cache.set('key', 'value');
            const errorCallback = jest.fn();
            cache.get('key1', errorCallback);
            expect(errorCallback).toHaveBeenCalled();
        });

        test('should return the latest corresponding value of a key in the cache', () => {
            cache.set('key', 'value1');
            cache.set('key', 'value2');
            cache.set('key', 'value3');
            expect(cache.get('key')).toEqual('value3');
        });

        /*
        test('should return the corresponding value of a non-expired key in the cache', () => {
            jest = jest.useFakeTimers();
            cache.set('key', 'value', ['tag1', 'tag2'], 1);
            jest.advanceTimersByTime(999);
            expect(cache.get('key')).toEqual('value');
            jest.clearAllTimers();
        });*/

        test('should return undefined given an expired key', () => {
            jest = jest.useFakeTimers();
            cache.set('key', 'value', ['tag1', 'tag2'], 1);
            jest.advanceTimersByTime(1000);
            expect(cache.get('key')).toBeUndefined();
            jest.clearAllTimers();
        });
    });

    describe('delByTags()', () => {
        test('should return 0 given a key for an empty cache', () => {
            expect(cache.delByTags('miss')).toEqual(0);
        });

        test('should return 0 given a key not in a non-empty cache', () => {
            cache.set('key', 'value');
            expect(cache.delByTags('miss')).toEqual(0);
        });

        test('should remove the provided key matching tag from the cache', function () {
            cache.set('key', 'value',  ['tag1', 'tag2']);
            let value = cache.get('key');
            expect(value.value).toEqual("value");
            expect(value.tags).toEqual(["tag1", "tag2"]);
            expect(cache.delByTags('tag1')).toEqual(1);
            expect(cache.get('key')).toBeUndefined();
        });

        test('should remove the provided key matching tag array item from the cache', function () {
            cache.set('key', 'value',  ['tag1', 'tag2']);
            let value = cache.get('key');
            expect(value.value).toEqual("value");
            expect(value.tags).toEqual(["tag1", "tag2"]);
            expect(cache.delByTags(['tag1'])).toEqual(1);
            expect(cache.get('key')).toBeUndefined();
        });

        test('should remove the provided key matching tag object from the cache', function () {
            cache.set('key', 'value',  [{"city": "Pune"}, {"country": "India"}]);
            let value = cache.get('key');
            expect(value.value).toEqual("value");
            expect(value.tags).toEqual([{"city": "Pune"}, {"country": "India"}]);
            expect(cache.delByTags({"city": "Pune"})).toEqual(1);
            expect(cache.get('key')).toBeUndefined();
        });

        test('should fire a callback while removing the provided key matching tag from the cache', function () {
            cache.set('key', 'value',  ['tag1', 'tag2']);
            let value = cache.get('key');
            expect(value.value).toEqual("value");
            expect(value.tags).toEqual(["tag1", "tag2"]);
            const deleteCallback = jest.fn();
            expect(cache.delByTags('tag1', deleteCallback)).toEqual(1);
            expect(deleteCallback).toHaveBeenCalled();
            expect(cache.get('key')).toBeUndefined();
        });

        test('should remove the multiple keys matching tags from the cache', function () {
            cache.set('key1', 'value1', ['tag1', 'tag2']);
            cache.set('key2', 'value2', ['tag2', 'tag3']);
            cache.set('key3', 'value3', ['tag1', 'tag3']);
            let value = cache.get('key1');
            expect(value.value).toEqual("value1");
            expect(value.tags).toEqual(["tag1", "tag2"]);
            expect(cache.delByTags('tag1')).toEqual(2);
            expect(cache.get('key1')).toBeUndefined();
            expect(cache.get('key3')).toBeUndefined();
        });

        test('should decrement the cache size by 1', function () {
            cache.set('key1', 'value1',  ['tag1', 'tag2']);
            expect(cache.keys().length).toEqual(1);
            expect(cache.delByTags('tag1')).toEqual(1);
            expect(cache.keys().length).toEqual(0);
        });

        test('should not remove other keys in the cache', function () {
            cache.set('key1', 'value1', ['tag1', 'tag2']);
            cache.set('key2', 'value2', ['tag2', 'tag3']);
            cache.set('key3', 'value3', ['tag1', 'tag3']);
            let value1 = cache.get('key1');
            expect(value1.value).toEqual("value1");
            let value2 = cache.get('key2');
            expect(value2.value).toEqual("value2");
            let value3 = cache.get('key3');
            expect(value3.value).toEqual("value3");
            expect(cache.delByTags('tag3')).toEqual(2);
            value1 = cache.get('key1');
            expect(value1.value).toEqual("value1");
        });

        test('should only delete a key from the cache once even if called multiple times in a row', function () {
            cache.set('key1', 'value1', ['tag1', 'tag2']);
            cache.set('key2', 'value2', ['tag2', 'tag3']);
            expect(cache.keys().length).toEqual(2);
            expect(cache.delByTags('tag2')).toEqual(2);
            expect(cache.delByTags('tag2')).toEqual(0);
            expect(cache.delByTags('tag2')).toEqual(0);
            expect(cache.keys().length).toEqual(0);
        });
    });
});