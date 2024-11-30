# [fs-play](https://github.com/UniBreakfast/fs-play)

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
