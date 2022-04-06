# User gRPC Service
Demo CRUD gRPC to generate to markdown document
> Developed by [Doan Thuan Thanh](mailto:doanthuanthanh88@gmail.com)  
> Updated at 4/6/2022, 9:43:26 AM  

| | Title | |  
|---|---|---|  
| |DEFAULT (1) | |
|**1**|[This is default doc](#This%20is%20default%20doc)| user/UserService.GetUsers() | 
| |RETURNS (1) | |
|**1**|[Test gRPC call](#Test%20gRPC%20call)| user/UserService.GetUsers() | 
| |USER (1) | |
|**1**|[Test gRPC call](#Test%20gRPC%20call)| user/UserService.GetUsers() | 
  

---

<a id="user-content-test%20grpc%20call" name="user-content-test%20grpc%20call"></a>
## [Test gRPC call](#) 


Package: `user`

Service: `UserService`

Method: `GetUsers`



<details>
<summary>server.proto</summary>

```protobuf
syntax = "proto3";

package user;

service UserService {
  rpc GetUsers(UserInput) returns (ResponseUser);
  rpc GetCustomers(UserInput) returns (ResponseUser);
}

message ResponseUser {
  optional int32 code = 1;
  repeated User data = 2;
}

message UserInput {
  string name = 1;
}

message User {
  string name = 1;
  int32 age = 2;
}
```
</details>


<br/>

## REQUEST
### Request data
<details>
  <summary>Example</summary>

```json
{
  "name": "thanh"
}
```

</details>

<details open>
  <summary>Schema</summary>

| Name | Type |
| --- | --- |
|  `@ROOT` | object |
| &nbsp;&nbsp;&nbsp;&nbsp; `name` | string |

</details>


## RESPONSE
### Response data
<details>
  <summary>Example</summary>

```json
{
  "data": [
    {
      "name": "thanh",
      "age": 1
    }
  ],
  "code": 1,
  "_code": "code"
}
```

</details>

<details open>
  <summary>Schema</summary>

| Name | Type |
| --- | --- |
|  `@ROOT` | object |
| &nbsp;&nbsp;&nbsp;&nbsp; `data` | array&lt;object&gt; |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; `name` | string |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; `age` | number |
| &nbsp;&nbsp;&nbsp;&nbsp; `code` | number |
| &nbsp;&nbsp;&nbsp;&nbsp; `_code` | string |

</details>


---

<a id="user-content-this%20is%20default%20doc" name="user-content-this%20is%20default%20doc"></a>
## [This is default doc](#)



Package: `user`

Service: `UserService`

Method: `GetUsers`



<details>
<summary>server.proto</summary>

```protobuf
syntax = "proto3";

package user;

service UserService {
  rpc GetUsers(UserInput) returns (ResponseUser);
  rpc GetCustomers(UserInput) returns (ResponseUser);
}

message ResponseUser {
  optional int32 code = 1;
  repeated User data = 2;
}

message UserInput {
  string name = 1;
}

message User {
  string name = 1;
  int32 age = 2;
}
```
</details>


<br/>

## REQUEST
### Request data
<details>
  <summary>Example</summary>

```json
{
  "name": "thanh"
}
```

</details>

<details open>
  <summary>Schema</summary>

| Name | Type |
| --- | --- |
|  `@ROOT` | object |
| &nbsp;&nbsp;&nbsp;&nbsp; `name` | string |

</details>


## RESPONSE
### Response data
<details>
  <summary>Example</summary>

```json
{
  "data": [
    {
      "name": "thanh",
      "age": 1
    }
  ],
  "code": 1,
  "_code": "code"
}
```

</details>

<details open>
  <summary>Schema</summary>

| Name | Type |
| --- | --- |
|  `@ROOT` | object |
| &nbsp;&nbsp;&nbsp;&nbsp; `data` | array&lt;object&gt; |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; `name` | string |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; `age` | number |
| &nbsp;&nbsp;&nbsp;&nbsp; `code` | number |
| &nbsp;&nbsp;&nbsp;&nbsp; `_code` | string |

</details>

  