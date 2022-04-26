const grpc = require("@grpc/grpc-js");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const protoLoader = require("@grpc/proto-loader");

const DB_PATH = __dirname + "/../todos_db.json";
let todos = JSON.parse(fs.readFileSync(DB_PATH)).todos;

const PROTO_PATH = __dirname + "/../todo.proto";
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const todo_proto = grpc.loadPackageDefinition(packageDefinition).todoservice;
const server = new grpc.Server();

server.addService(todo_proto.TodoService.service, {
  get: (call, callback) => {
    let todo = todos.find(
      (t) => t.id.toString() === call.request.id.toString()
    );
    if (todo != -1) callback(null, todo);
    else
      callback({
        code: grpc.status.NOT_FOUND,
        details: "Not Found",
      });
  },
  list: (_, callback) => {
    callback(null, { todos: todos });
  },
  insert: (call, callback) => {
    let todo = call.request;
    todo.id = uuidv4();
    todos.push(todo);
    fs.writeFileSync(DB_PATH, JSON.stringify({ todos: todos }));
    callback(null, todo);
  },
  update: (call, callback) => {
    let todo = todos.find(
      (t) => t.id.toString() === call.request.id.toString()
    );
    if (todo) {
      todo.name = call.request.name;
      todo.iscompleted = call.request.iscompleted;
      fs.writeFileSync(DB_PATH, JSON.stringify({ todos: todos }));
      callback(null, todo);
    } else {
      callback({
        code: grpc.status.NOT_FOUND,
        details: "Not Found",
      });
    }
  },
  delete: (call, callback) => {
    let todoDelete = todos.findIndex(
      (n) => n.id.toString() === call.request.id.toString()
    );
    if (todoDelete != -1) {
      todos.splice(todoDelete, 1);
      fs.writeFileSync(DB_PATH, JSON.stringify({ todos: todos }));
      callback(null, {});
    } else {
      callback({
        code: grpc.status.NOT_FOUND,
        details: "Not Found",
      });
    }
  },
});

server.bindAsync(
  "127.0.0.1:50051",
  grpc.ServerCredentials.createInsecure(),
  () => {
    console.log("server is running at http://127.0.0.1:50051");
    server.start();
  }
);
