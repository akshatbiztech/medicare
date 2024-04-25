import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";
import pkg from "@aws-sdk/lib-dynamodb";
import crypto from "crypto";

const { DynamoDBDocumentClient, ScanCommand, GetCommand, UpdateCommand } = pkg;

// Initialize DynamoDB Document Client
const dynamoDB = DynamoDBDocumentClient.from(new DynamoDBClient({}));

// Define the DynamoDB table name for users
const table = "user_table";

// Lambda function handler for users
export const handler = async (event) => {
  try {
    // Extract the action from the event
    const action = event.data.action;
    let response;

    // Perform actions based on the action received
    switch (action) {
      case "getAllUsers":
        response = await getAllUsers();
        break;
      case "getSingleUser":
        response = await getSingleUser(event.data.id);
        break;
      case "updateUser":
        response = await updateUser(event.data.id, event.data.user);
        break;
      case "deleteUser":
        response = await deleteUser(event.data.id);
        break;
      default:
        response = {
          statusCode: 405,
          body: JSON.stringify({ message: "Method Not Allowed" }),
        };
    }

    return response;
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal Server Error" }),
    };
  }
};

// Function to get all users
const getAllUsers = async () => {
  try {
    const params = {
      TableName: table,
    };

    const { Items } = await dynamoDB.send(new ScanCommand(params));

    return {
      statusCode: 200,
      body: { message: "Success: GET all users", users: Items },
    };
  } catch (error) {
    console.error("Error retrieving users:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal Server Error" }),
    };
  }
};

// Function to get a single user by ID
const getSingleUser = async (id) => {
  try {
    const params = {
      TableName: table,
      Key: { user_id: id },
    };

    const { Item } = await dynamoDB.send(new GetCommand(params));

    if (!Item) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "User not found" }),
      };
    }

    return {
      statusCode: 200,
      body: { message: "Success: GET single user", user: Item },
    };
  } catch (error) {
    console.error("Error retrieving user:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal Server Error" }),
    };
  }
};

// Function to update a user by ID
const updateUser = async (id, user) => {
  try {
    if (!user || typeof user !== "object" || Object.keys(user).length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "Invalid or empty user object provided",
        }),
      };
    }

    const params = {
      TableName: table,
      Key: { user_id: id },
      UpdateExpression:
        "SET " +
        Object.keys(user)
          .map((key) => `#${key} = :${key}`)
          .join(", "),
      ExpressionAttributeNames: Object.keys(user).reduce(
        (acc, key) => ({ ...acc, [`#${key}`]: key }),
        {}
      ),
      ExpressionAttributeValues: Object.keys(user).reduce(
        (acc, key) => ({ ...acc, [`:${key}`]: user[key] }),
        {}
      ),
      ReturnValues: "ALL_NEW",
    };

    const { Attributes } = await dynamoDB.send(new UpdateCommand(params));

    return {
      statusCode: 200,
      body: { message: "Success: Update single user", user: Attributes },
    };
  } catch (error) {
    console.error("Error updating user:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal Server Error" }),
    };
  }
};

// Function to delete a user by ID
const deleteUser = async (id) => {
  try {
    // Your delete logic here
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Success: Delete single user" }),
    };
  } catch (error) {
    console.error("Error deleting user:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal Server Error" }),
    };
  }
};
