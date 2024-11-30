# [fs-play](https://github.com/UniBreakfast/fs-play)

# fs-glass

`fs-glass` is a set of JavaScript modules that provide a transparent interface for performing file system operations over HTTP. It consists of a front-end module (`fs-glass-front.js`) for the client-side and a back-end module (`fs-glass-back.js`) for the server-side. The name "glass" signifies that while the modules are powerful and useful, they can be dangerous if misused—much like handling glass.

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Setup Instructions](#setup-instructions)
  - [Front-End Setup](#front-end-setup)
  - [Back-End Setup](#back-end-setup)
- [How to Use](#how-to-use)
  - [Front-End Methods](#front-end-methods)
  - [Back-End Functions](#back-end-functions)
- [Sample Usage](#sample-usage)
  - [Front-End Example](#front-end-example)
  - [Back-End Example Without Express](#back-end-example-without-express)
- [Security Considerations](#security-considerations)
- [Licensing Information](#licensing-information)

## Overview

`fs-glass` allows developers to perform file system operations such as reading, writing, copying, moving, and deleting files and directories over HTTP. This can be particularly useful for web applications that require server-side file manipulation initiated from the client-side.

## Key Features

- **File Writing and Reading**: Write to and read from files on the server.
- **Directory Management**: Create and delete directories recursively.
- **File Operations**: Copy, move, duplicate, and rename files and directories.
- **Exploration**: Retrieve directory listings and file metadata.
- **Promise-Based API**: Utilizes promises for asynchronous operations.
- **Easy Integration**: Simple to integrate with existing front-end and back-end setups.

## Setup Instructions

### Front-End Setup

Include the `fs-glass-front.js` script in your HTML file or import it into your JavaScript module.

```html
<script src="path/to/fs-glass-front.js"></script>
```

Or, if using modules:

```javascript
import fs from './fs-glass-front.js';
```

### Back-End Setup

Place `fs-glass-back.js` in your server directory and require it in your Node.js application.

```javascript
const fsOperations = require('./fs-glass-back.js');
```

## How to Use

### Front-End Methods

The front-end `fs` object provides the following methods:

- **`fs.write(path, body)`**: Writes data to a file at the specified path.

- **`fs.mkdir(path)`**: Creates a directory at the specified path.

- **`fs.copy(from, to, name)`**: Copies a file or directory from one location to another.

- **`fs.move(from, to, name)`**: Moves a file or directory from one location to another.

- **`fs.dup(path, name)`**: Duplicates a file or directory at the same location with a new name.

- **`fs.rename(path, name)`**: Renames a file or directory.

- **`fs.del(path)`**: Deletes a file or directory at the specified path.

- **`fs.explore(path)`**: Retrieves metadata and structure of the directory at the specified path.

- **`fs.recon(path)`**: Retrieves metadata such as sizes of files within the directory.

### Back-End Functions

The back-end module exports the following functions:

- **`mkdir(path)`**: Creates a directory recursively.

- **`copy(from, to, name)`**: Copies a file or directory to a new location.

- **`move(from, to, name)`**: Moves a file or directory to a new location.

- **`dup(path, name)`**: Duplicates a file or directory with a new name.

- **`rename(path, name)`**: Renames a file or directory.

- **`remove(path)`**: Deletes a file or directory recursively.

- **`explore(path)`**: Retrieves the structure and metadata of a directory.

- **`recon(path)`**: Retrieves sizes and other metadata of files in a directory.

## Sample Usage

### Front-End Example

```javascript
// Writing data to a file
fs.write('/path/to/file.txt', 'Hello, World!')
  .then(response => console.log('File written successfully'))
  .catch(error => console.error('Error writing file:', error));

// Creating a directory
fs.mkdir('/path/to/new/directory')
  .then(response => console.log('Directory created successfully'))
  .catch(error => console.error('Error creating directory:', error));

// Copying a file
fs.copy('/path/to/source.txt', '/path/to/destination', 'copied.txt')
  .then(response => console.log('File copied successfully'))
  .catch(error => console.error('Error copying file:', error));
```

### Back-End Example Without Express

Below is a simple example of setting up an HTTP server without using Express. This server listens for HTTP requests and performs file system operations based on the request method and URL.

```javascript
const http = require('http');
const url = require('url');
const fs = require('fs');
const fsOperations = require('./fs-glass-back.js');
const { mkdir, copy, move, dup, rename, remove, explore, recon } = fsOperations;

const port = 3000;

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = decodeURIComponent(parsedUrl.pathname);
  let body = [];

  req.on('data', chunk => {
    body.push(chunk);
  });

  req.on('end', () => {
    body = Buffer.concat(body).toString();

    // Handle CORS (if needed)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    // Define response handlers
    const sendResponse = (statusCode, data) => {
      res.writeHead(statusCode, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(data));
    };

    const sendError = (statusCode, message) => {
      res.writeHead(statusCode, { 'Content-Type': 'text/plain' });
      res.end(message);
    };

    // Route handling
    if (req.method === 'PUT') {
      // Write file
      fs.writeFile('.' + pathname, body, err => {
        if (err) return sendError(500, err.toString());
        sendResponse(200, { message: 'File written successfully' });
      });
    } else if (req.method === 'POST') {
      // Parse operation from body
      let operation;
      try {
        operation = JSON.parse(body);
      } catch (err) {
        return sendError(400, 'Invalid JSON');
      }

      const { op, args } = operation;
      if (op && ops[op]) {
        ops[op](...args)
          .then(() => sendResponse(200, { message: `${op} operation completed successfully` }))
          .catch(err => sendError(500, err.toString()));
      } else {
        sendError(400, 'Invalid operation');
      }
    } else if (req.method === 'DELETE') {
      // Delete file or directory
      remove('.' + pathname)
        .then(() => sendResponse(200, { message: 'File or directory deleted successfully' }))
        .catch(err => sendError(500, err.toString()));
    } else if (req.method === 'GET') {
      // Handle explore and recon
      if (pathname.endsWith('??')) {
        const path = '.' + pathname.slice(0, -2);
        explore(path)
          .then(data => sendResponse(200, data))
          .catch(err => sendError(500, err.toString()));
      } else if (pathname.endsWith('?')) {
        const path = '.' + pathname.slice(0, -1);
        recon(path)
          .then(data => sendResponse(200, data))
          .catch(err => sendError(500, err.toString()));
      } else {
        // Read file
        fs.readFile('.' + pathname, (err, data) => {
          if (err) return sendError(500, err.toString());
          res.writeHead(200, { 'Content-Type': 'application/octet-stream' });
          res.end(data);
        });
      }
    } else {
      sendError(405, 'Method Not Allowed');
    }
  });
});

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});

// Define the operations mapping
const ops = { mkdir, copy, move, dup, rename };
```

**Explanation:**

- **HTTP Server Creation**: Uses Node.js's built-in `http` module to create a server.
- **CORS Handling**: Sets headers to handle Cross-Origin Resource Sharing if required.
- **Request Parsing**: Parses incoming requests to determine the operation.
- **Operation Handling**: Calls the appropriate function from `fs-glass-back.js` based on the HTTP method and request path.
- **Response Sending**: Sends back JSON responses for successful operations or plain text errors.

**Note:** This is a basic example for illustrative purposes. In a production environment, you should implement robust error handling, input validation, and security measures.

## Security Considerations

**Warning**: `fs-glass` performs file system operations over HTTP, which can be extremely dangerous if not properly secured. Without adequate authentication and authorization mechanisms, unauthorized users could potentially read, modify, or delete sensitive files on the server.

To mitigate risks:

- **Implement Authentication**: Ensure that only authorized users can perform file system operations.

- **Validate Input**: Rigorously validate and sanitize all inputs to prevent path traversal and injection attacks.

- **Use HTTPS**: Always use HTTPS to encrypt the data transmitted between the client and server.

- **Limit Access**: Restrict file system access to specific directories and files that are necessary for your application.

- **Logging and Monitoring**: Keep detailed logs of all file system operations and monitor them for suspicious activities.

**Disclaimer**: Use `fs-glass` at your own risk. The authors are not responsible for any damages or data loss resulting from the use of this software.

## Licensing Information

This project is licensed under the MIT License.

---

**Note**: Remember that `fs-glass` is a powerful tool that should be used with caution. Always ensure that your server-side implementation includes proper security measures to prevent unauthorized access and operations.

![image](https://github.com/user-attachments/assets/60c83dc5-4904-4a3d-a623-038aae4c0d4a)

## One ultimate function to set up a dropzone element for files uploading

# setUploader

`setUploader` is a flexible JavaScript utility function that simplifies file uploading in web applications. It allows you to configure file selection via buttons or drag-and-drop, handle multiple files, and define custom behaviors for informing users and reporting upload statuses.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
  - [Syntax](#syntax)
  - [Parameters](#parameters)
- [Examples](#examples)
- [License](#license)

## Features

- **Flexible File Selection**: Supports file selection through buttons or drag-and-drop areas.
- **Multiple File Uploads**: Easily enable or disable multiple file uploads.
- **Custom Callbacks**: Define custom functions to inform users and handle server responses.
- **Dynamic Paths and Names**: Customize upload paths and file names with functions or static values.
- **Easy Integration**: Simple to integrate into existing projects with minimal setup.

## Installation

Include the `setUploader` function in your JavaScript code. You can add it directly to your script or import it as a module if you've structured it that way.

```html
<script src="path/to/your/setUploader.js"></script>
```

## Usage

### Syntax

```javascript
setUploader({
  pathsrc,
  namesrc,
  chooser,
  starter,
  dropzone,
  informcb,
  reportcb,
  fetchArgs,
  multiple
});
```

### Parameters

- **`pathsrc`** `(String | Function)`: Optional. The upload path. Can be a string or a function that returns a string.

- **`namesrc`** `(String | Function)`: Optional. The file name to use on upload. Can be a string or a function that returns a string.

- **`chooser`** `(HTMLElement | Function)`: Optional. An HTML element (like a button) or a function that triggers the file selection dialog when clicked.

- **`starter`** `(HTMLElement | Function)`: Optional. An HTML element (like a button) or a function that starts the upload process when clicked.

- **`dropzone`** `(HTMLElement)`: Optional. An HTML element that acts as a drop zone for files to be uploaded via drag-and-drop.

- **`informcb`** `(Function)`: Optional. A callback function `informcb(files, path, getName)` called when files are selected to inform the user.

- **`reportcb`** `(Function)`: Optional. A callback function `reportcb(response, i)` called after each file upload completes to handle the server's response.

- **`fetchArgs`** `(Array | Function)`: Optional. An array `[url, options]` or a function `fetchArgs(path, name, body)` returning such an array, specifying arguments for the `fetch` API.

- **`multiple`** `(Boolean)`: Optional. Enables multiple file selection if set to `true`. Defaults to `false`.

## Examples

### Basic Example

```javascript
setUploader({
  chooser: document.getElementById('selectBtn'),
  informcb: (files) => {
    console.log('Selected files:', files);
  },
  reportcb: (response, i) => {
    response.text().then((text) => console.log(`Response for file ${i}:`, text));
  },
});
```

### Advanced Example with All Options

```javascript
setUploader({
  pathsrc: () => document.getElementById('pathInput').value,
  namesrc: () => document.getElementById('nameInput').value,
  chooser: document.getElementById('selectBtn'),
  starter: document.getElementById('uploadBtn'),
  dropzone: document.getElementById('dropZone'),
  multiple: true,
  informcb: (files, path, getName) => {
    document.getElementById('info').innerText = `Uploading ${files.length} files to ${path}`;
  },
  reportcb: (response, i) => {
    response.text().then((text) => {
      console.log(`Server response for file ${i}: ${text}`);
    });
  },
  fetchArgs: (path, name, body) => {
    return [`${path}/${name}`, { method: 'PUT', body }];
  },
});
```

### Explanation of the Advanced Example

- **Dynamic Path and Name**: Uses functions to dynamically get the path and file name from input fields.
- **Custom Inform Callback**: Updates an element with ID `info` to inform the user about the upload.
- **Custom Report Callback**: Logs the server response for each file.
- **Custom Fetch Arguments**: Specifies how to construct the `fetch` call for uploading files.

## License

This project is licensed under the MIT License.

![image](https://github.com/user-attachments/assets/fc41480f-26e5-4806-a362-87094f69f072)

![image](https://github.com/user-attachments/assets/1160739c-d4ff-4247-a40e-e9fe61858bbf)

![image](https://github.com/user-attachments/assets/759b1d9d-d3b1-442b-b0a7-00c96105729c)
