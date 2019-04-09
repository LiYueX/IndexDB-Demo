


export default class IndexedDB {



	constructor (database, version, store) {
		this.database = database;
		this.version = version;
		this.db = null;
		this.store = store;
	}
 	pushErr = (err) => {throw new Error(err)}
	callback () { 
		console.log(`${this.database}, ${this.version}`)
	}

  open (table) {
		let request;
		if(window.indexedDB) {
			request = window.indexedDB.open(this.database, this.version);
			request.onerrror = (event) => {
				pushErr(event)
			}
			request.onsuccess = (event) => {
				this.db = request.result; 
				console.log('get db');
				var objectStore;
				if(this.db && !this.db.objectStoreNames.contains(table.name)) {
					objectStore = this.db.createObjectStore(table.name, table.options)
					// 对name字段建立索引
					table.indexs.map( (index) => {
						objectStore.createIndex(index.name, index.prop, index.option);
					}) 
					console.log('success')
				}
			}
			request.onupgradeneeded = (event) => {
				this.db = event.target.result;
				console.log('upgrade');
				var objectStore;
				if(this.db && !this.db.objectStoreNames.contains('person')) {
					objectStore = this.db.createObjectStore('person',{
						keyPath: 'id'
					})
					// 对name字段建立索引
					objectStore.createIndex('name', 'name', { unique: false})
					objectStore.createIndex('phone', 'phone', { unique: true})
				}				
			}


		}
	}


	addAll (store, table) {

		if(this.db) {

			let transaction = this.db.transaction([table], 'readwrite');
			let objectStore = transaction.objectStore(table)
			store.map((item) => {
				let request = objectStore.put(item);
				request.onsuccess = (event) => {
					console.log('add success');
				}
				request.onerror = (event) => {
					pushErr(event.target.error)
				}
			})
		}

	}

  add (item, table, pushErr = (err) => {throw err}) {

  	console.log(this.db);
		if(this.db) {

				let transaction = this.db.transaction([table], 'readwrite');
				let objectStore = transaction.objectStore(table);
				let request = objectStore.put(item);

				request.onsuccess = (event) => {
					console.log('add success');
				}	

				request.onerror = (event) => {
					pushErr(event.target.error);
				}
		}
		
	}

	read (i, table) {
		if(this.db) {
			var getData;
			var transaction = this.db.transaction([table]);
			var objectStore = transaction.objectStore(table);
			var request = objectStore.get(i);
			request.onerror = (event) => {
				pushErr('读取异常')
			}
			request.onsuccess = (event) => {
				if(request.result) {
					getData = request.result
				} else {
					pushErr('没有数据');
				}
			}
			return getData;					
		}
	}



  readAll (table) {
		let getData = [];
		console.log(table)
		var objectStore = this.db.transaction(table).objectStore(table)

		objectStore.openCursor().onsuccess =  (event) => {
				var cursor = event.target.result;
				// console.log(cursor)
				if(cursor) {
					getData.push({ id: cursor.value.id, name: cursor.value.name, phone: cursor.value.phone });
					//console.log(cursor.value.name, cursor.value.id, cursor.value.phone);
					//console.log(cursor.key, cursor.value.name, cursor.value.age, cursor.value.phone);
					cursor.continue();
				} else {
					console.log('没有更多数据了');
				}
		}

		return getData;

	}

	// 删除 指定行
	remove (i, table) {
		var request = this.db.transaction([table], 'readwrite').objectStore(table).delete(i);
		request.onsuccess = (event) => {
			console.log('remove success');
		}
		request.onerror = (event) => {
			pushErr('删除失败')
		}
	}

	removeAll () {
		var request = this.db.transaction(['person'], 'readwrite').objectStore('person').clear();
		request.onsuccess = (event) => {
			console.log('clear success');
		}
		request.onerror = (event) => {
			pushErr(event.target.error);
		} 
	}

	// 指定更新
	update (o, table) {
		var request = this.db.transaction([table], 'readwrite').objectStore(table)
		.put(o)

		request.onsuccess = (event) => {
			console.log('update success');
		}
		request.onerror = (event) => {
			pushErr(event)
		}
	}



}
