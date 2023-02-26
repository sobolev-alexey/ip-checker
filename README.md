# IP Blocklist Service

Microservice that manages a blocklist of IPs.  
This service can be used to prevent abuse in different applications to ban IPs that are known to be used for malicious purposes.

### Installation

```bash
    npm install
```
or 
```bash
    yarn
```

### Run

```bash
    npm run dev
```
or 

```bash
    yarn dev
```

## Usage

The service has a single REST endpoint that takes an IP v4 encoded as a string (e.g. `"127.0.0.1"`), and returns `"true"` if the IP is part of the blocklist, and `"false"` otherwise.

This is an example of how calling the microservice can look like, but not a strict requirement:

```bash
$ curl http://localhost:3000/ips/127.0.0.1
false
```  
  
```bash
$ curl http://localhost:3000/ips/2.189.59.146
true
```  
  
```bash
$ curl http://localhost:3000/ips/1234567  
{"error":"Wrong IP format"}
```

### Data source

[This public list](https://github.com/stamparm/ipsum), of IP addresses is fetched on service start and gets updated every 24hs. The microservice stays in sync with it.

### Config

Port number and endpoint for the IPs list can be configured in `.env` file.

```javascript
PORT=3000
BLOCKLIST_SOURCE="https://raw.githubusercontent.com/stamparm/ipsum/master/ipsum.txt"
```

### Performance

The **Set** object was chosen to store blocked IP addresses for performance reasons.
Time complexity of `Set.has()` operation has amortized runtime of `O(1)` with worst case of `O(n)`, where `O(n)` is an extreme case when there are too many collisions.  
According to the specification, it could be represented internally as a hash table (with `O(1)` lookup), a search tree (with `O(log(n)`) lookup), or any other data structure, as long as the complexity is better than `O(n)`.  
It outperforms `Array.indexOf()` and `Array.includes()` for large datasets.  

To minimize the size of the IPs list, the content is requested to be sent gzip encoded, which reduces the content size by 3 times from 3.4 Mb to 1.17 Mb

<br />  

_*Coded by sobolev_alexey*_




