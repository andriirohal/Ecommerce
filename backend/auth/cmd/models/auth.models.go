package models

import (
  "github.com/golang-jwt/jwt/v5"
  "time"
);

type UserPayload struct {
  UserId string `json:"userId"`;
  Email string `json:"email"`;
  Role string `json:"role"`;
  jwt.RegisteredClaims;
};

type UserResponse struct {
  UserId string `json:"userId"`;
  Name string `json:"name"`;
  Email string `json:"email"`;
  Role string `json:"role"`;
  AccessToken string `json:"accessToken"`;
  RefreshToken *string `json:"refreshToken"`;
  CreatedAt time.Time `json:"createdAt"`;
};

type UserRow struct {
  UserId string `json:"userId"`;
  Name string `json:"name"`;
  Email string `json:"email"`;
  Role string `json:"role"`;
  RefreshToken *string `json:"refreshToken"`;
  CreatedAt time.Time `json:"createdAt"`;
};

type UserInput struct {
  Name string `json:"name"`;
  Email string `json:"email"`;
  Password string `json:"password"`;
};

type UserCreated struct {
  UserId string `json:"userId"`;
  Role string `json:"role"`;
  CreatedAt time.Time `json:"createdAt"`;
};

type UserRecord struct {
  UserId string `json:"userId"`;
  Name string `json:"name"`;
  Email string `json:"email"`;
  Role string `json:"role"`;
  CreatedAt time.Time `json:"createdAt"`;
};

type UserModel struct {
  UserId string `json:"userId"`;
  Name string `json:"name"`;
  Email string `json:"email"`;
  Password string `json:"password"`;
  Role string `json:"role"`;
  CreatedAt time.Time `json:"createdAt"`;
};

type AuthInput struct {
  Email string `json:"email"`;
  Password string `json:"password"`;
};

type Authentication struct {
  AccessToken string `json:"accessToken"`;
  RefreshToken string `json:"refreshToken"`;
};

type UserSummary struct {
  TotalOrders int `json:"totalOrders"`;
  TotalPlants int `json:"totalPlants"`;
  LastOrderDate *time.Time `json:"lastOrderDate"`;
};