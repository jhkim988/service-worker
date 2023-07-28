const promiseOption = {
  dbFactory: {
    resolve: 'onsuccess',
    reject: 'onerror',  
  },
  transaction: {
    resolve: 'oncomplete',
    reject: 'onerror',
  },
  objectStore: {
    resolve: 'onsuccess',
    reject: 'onerror',
  },
  cursor: {
    resolve: 'onsuccess',
    reject: 'onerror',
  },
}

// request 를 Promise 로 감싸서 반환하는 함수
const requestPromise = (request, handle) => {
  return new Promise((resolve, reject) => {
    request[handle.reject] = (event) => {
      reject(event);
    }
    request[handle.resolve] = (event) => {
      resolve(event);
    }
  });
}

export const indexedDBUtil = (dbName, version, schema, initCache) => {
  if (!indexedDB) {
    throw new Error('indexedDB is not supported');
  }

  let db = indexedDB;
	let cache = null;

	const isOpen = () => db !== null;

	const open = () => {
		const request = indexedDB.open(dbName, version);
		request.onupgradeneeded = (event) => {
			db.createObjectStore(schema.storeName, schema.storeOption);
		};
    return requestPromise(request, promiseOption.dbFactory).then((event) => db = event.target.result);
	};

	const close = () => {
		db.close();
		db = null;
	};

	const add = (data) => {
    const transaction = db.transaction(schema.storeName, 'readwrite');
    const transactionPromise = requestPromise(transaction, promiseOption.transaction);
    const objectStorePromise = requestPromise(transaction.objectStore(schema.storeName).add(data), promiseOption.objectStore);
    return { transactionPromise, objectStorePromise }
  };

	const addAll = (data) => {
    const transaction = db.transaction(schema.storeName, 'readwrite');
    const objectStore = transaction.objectStore(schema.storeName);
    return Promise.all(data.map(item => requestPromise(objectStore.add(item), promiseOption.objectStore)));
  };

	const remove = (key) => {
    const transaction = db.transaction(schema.storeName, 'readwrite');
    const objectStore = transaction.objectStore(schema.storeName);
    return requestPromise(objectStore.delete(key), promiseOption.objectStore);
  };

	const clear = () => {
    const transaction = db.transaction(schema.storeName, 'readwrite');
    const objectStore = transaction.objectStore(schema.storeName);
    return requestPromise(objectStore.clear(), promiseOption.objectStore);
  };

	const findByKey = (key) => {
    const transaction = db.transaction(schema.storeName, 'readonly');
    const objectStore = transaction.objectStore(schema.storeName);
    return requestPromise(objectStore.get(key), promiseOption.objectStore);
  };

	const find = (filterCallback) => {
    const ret = [];
    const transaction = db.transaction(schema.storeName, 'readonly');
    const objectStore = transaction.objectStore(schema.storeName);
    const request = objectStore.openCursor();
    return new Promise((resolve, reject) => {
      request.onerror = (event) => {
        reject(event);
      }
      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          if (filterCallback(cursor.value)) {
            ret.push(cursor.value);
            cursor.continue();
          }
        } else {
          resolve(ret);
        }
      }
    });
  };

	const getAll = async () => {
		if (cache === null) {
			return await updateCache();
		}
		return cache;
	};
	
	const findOnMemory = async (filterCallback) => {
    if (cache === null) {
      await updateCache();
    }
    return cache.filter(filterCallback);
	};

	const put = (data) => {
    const transaction = db.transaction(schema.storeName, 'readwrite');
    const objectStore = transaction.objectStore(schema.storeName);
    return requestPromise(objectStore.put(data), promiseOption.objectStore);
	};
			
	const updateCache = () => {
		const store = db.transaction(schema.storeName, 'readonly').objectStore(schema.storeName);
		const request = store.getAll();
		return new Promise((resolve, reject) => {
			request.onerror = (event) => {
				reject(event);
			}
			request.onsuccess = (event) => {
				cache = event.target.result;
				resolve(cache);
			}	
		});
	};

  const createStore = () => {
    const transaction = db.transaction(schema.storeName, 'readwrite');
    const objectStore = transaction.objectStore(schema.storeName);
    return objectStore;
  }

  initCache && updateCache();

	return {
		isOpen,
		open,
		close,
		add,
		addAll,
		remove,
		clear,
		findByKey,
		find,
		getAll,
		findOnMemory,
		put,
		updateCache,
    createStore,
  }
}