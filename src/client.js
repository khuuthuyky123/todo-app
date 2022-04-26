const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const PROTO_PATH = __dirname + "/../todo.proto";
var packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const todo_proto = grpc.loadPackageDefinition(packageDefinition).todoservice;

const client = new todo_proto.TodoService(
  "localhost:50051",
  grpc.credentials.createInsecure()
);

function getAllTodo() {
  client.list({}, (err, response) => {
    if (!err) {
      console.log("successfullt fetched todo lists");
      console.log(response);
    } else {
      console.error(err);
    }
  });
}

function insertTodo(newTodo) {
  client.insert(newTodo, (error, todo) => {
    if (!error) {
      console.log("New Todo inserted successfully");
    } else {
      console.error(error);
    }
  });
}

function deleteTodo(id) {
  client.delete({ id: id }, (error, _) => {
    if (!error) {
      console.log("Todo is deleted Successfully");
    } else {
      console.error(error);
    }
  });
}

function updateTodo(todo) {
  client.update(todo, (error, todo) => {
    if (!error) {
      console.log("Note is updated successfully", todo);
    } else {
      console.error(error);
    }
  });
}

function getTodo(id) {
  client.get({ id: id }, (error, todo) => {
    if (!error) {
      console.log("Todo is:", todo);
    } else {
      console.error(error);
    }
  });
}

// getAllTodo();
// getTodo(1);

// let newTodo = {
//   name: "New checklist",
//   iscompleted: false,
// };
// insertTodo(newTodo);
// getAllTodo();

// let todo = {
//   id : '1',
//   name : 'code project gRPC',
//   iscompleted : true
// }
// updateTodo(todo);
// getAllTodo();

// deleteTodo('73bca915-a803-45a6-b625-aab8a1533b06');
// getAllTodo();
