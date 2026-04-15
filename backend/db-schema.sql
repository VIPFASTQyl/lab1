-- MSSQL schema for TicketApp - Comprehensive Ticket Management System

-- Identity/Users
CREATE TABLE Users (
  Id INT IDENTITY(1,1) PRIMARY KEY,
  Name NVARCHAR(100) NOT NULL,
  Email NVARCHAR(255) NOT NULL UNIQUE,
  PasswordHash NVARCHAR(255) NOT NULL,
  IsAdmin BIT NOT NULL DEFAULT 0,
  ResetToken NVARCHAR(255),
  ResetTokenExpiry DATETIME2,
  CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);

-- Venues (Vendndodhjet)
CREATE TABLE Venues (
  VenueId INT IDENTITY(1,1) PRIMARY KEY,
  Name NVARCHAR(200) NOT NULL,
  Address NVARCHAR(255) NOT NULL,
  City NVARCHAR(100) NOT NULL,
  Capacity INT NOT NULL,
  Phone NVARCHAR(20),
  Email NVARCHAR(255),
  Description NVARCHAR(MAX),
  CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);

-- Events (Ngjarjet)
CREATE TABLE Events (
  EventId INT IDENTITY(1,1) PRIMARY KEY,
  Title NVARCHAR(200) NOT NULL,
  Description NVARCHAR(MAX),
  Category NVARCHAR(50) NOT NULL, -- Concert, Sports, Theater, Cultural, Other
  EventDate DATE NOT NULL,
  StartTime TIME,
  EndTime TIME,
  VenueId INT NOT NULL,
  Status NVARCHAR(50) NOT NULL DEFAULT 'Upcoming', -- Upcoming, Ongoing, Completed, Cancelled
  CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  UpdatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  FOREIGN KEY (VenueId) REFERENCES Venues(VenueId)
);

-- Sectors (Sektoret)
CREATE TABLE Sectors (
  SectorId INT IDENTITY(1,1) PRIMARY KEY,
  VenueId INT NOT NULL,
  SectorName NVARCHAR(100) NOT NULL,
  Capacity INT NOT NULL,
  BasePrice DECIMAL(10,2) NOT NULL,
  Description NVARCHAR(MAX),
  CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  FOREIGN KEY (VenueId) REFERENCES Venues(VenueId)
);

-- Tickets (Biletat)
CREATE TABLE Tickets (
  TicketId INT IDENTITY(1,1) PRIMARY KEY,
  EventId INT NOT NULL,
  SectorId INT NOT NULL,
  SeatNumber NVARCHAR(20) NOT NULL,
  Price DECIMAL(10,2) NOT NULL,
  Status NVARCHAR(50) NOT NULL DEFAULT 'Available', -- Available, Sold, Reserved, Cancelled
  TicketType NVARCHAR(50) NOT NULL DEFAULT 'General', -- General, VIP, Premium, etc
  CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  FOREIGN KEY (EventId) REFERENCES Events(EventId),
  FOREIGN KEY (SectorId) REFERENCES Sectors(SectorId)
);

-- Clients (Klientet)
CREATE TABLE Clients (
  ClientId INT IDENTITY(1,1) PRIMARY KEY,
  FirstName NVARCHAR(100) NOT NULL,
  LastName NVARCHAR(100) NOT NULL,
  Email NVARCHAR(255) NOT NULL UNIQUE,
  Phone NVARCHAR(20),
  Address NVARCHAR(255),
  RegistrationDate DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);

-- Orders (Porositë)
CREATE TABLE Orders (
  OrderId INT IDENTITY(1,1) PRIMARY KEY,
  ClientId INT NOT NULL,
  OrderDate DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  TotalAmount DECIMAL(10,2) NOT NULL,
  Status NVARCHAR(50) NOT NULL DEFAULT 'Pending', -- Pending, Confirmed, Completed, Cancelled
  PaymentMethod NVARCHAR(50),
  CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  UpdatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  FOREIGN KEY (ClientId) REFERENCES Clients(ClientId)
);

-- Order Details (Detajet_Porosise)
CREATE TABLE OrderDetails (
  DetailId INT IDENTITY(1,1) PRIMARY KEY,
  OrderId INT NOT NULL,
  TicketId INT NOT NULL,
  Quantity INT NOT NULL,
  UnitPrice DECIMAL(10,2) NOT NULL,
  TotalPrice DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (OrderId) REFERENCES Orders(OrderId),
  FOREIGN KEY (TicketId) REFERENCES Tickets(TicketId)
);

-- Payments (Pagesat)
CREATE TABLE Payments (
  PaymentId INT IDENTITY(1,1) PRIMARY KEY,
  OrderId INT NOT NULL,
  PaymentDate DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  Amount DECIMAL(10,2) NOT NULL,
  PaymentMethod NVARCHAR(50) NOT NULL, -- Card, Bank Transfer, Cash, Online
  Status NVARCHAR(50) NOT NULL DEFAULT 'Pending', -- Pending, Completed, Failed, Refunded
  Reference NVARCHAR(100),
  CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  FOREIGN KEY (OrderId) REFERENCES Orders(OrderId)
);

-- Organizers (Organizatoret)
CREATE TABLE Organizers (
  OrganizerId INT IDENTITY(1,1) PRIMARY KEY,
  Name NVARCHAR(200) NOT NULL,
  Email NVARCHAR(255),
  Phone NVARCHAR(20),
  Address NVARCHAR(255),
  OrganizerType NVARCHAR(50) NOT NULL, -- Company, Individual, Agency
  Description NVARCHAR(MAX),
  CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);

-- Event Organizers (Ngjarje_Organizator)
CREATE TABLE EventOrganizers (
  EventOrganizerId INT IDENTITY(1,1) PRIMARY KEY,
  EventId INT NOT NULL,
  OrganizerId INT NOT NULL,
  Role NVARCHAR(100), -- Organizer, Promoter, Sponsor, etc
  Notes NVARCHAR(MAX),
  FOREIGN KEY (EventId) REFERENCES Events(EventId),
  FOREIGN KEY (OrganizerId) REFERENCES Organizers(OrganizerId)
);

-- Discounts (Zbritjet)
CREATE TABLE Discounts (
  DiscountId INT IDENTITY(1,1) PRIMARY KEY,
  Code NVARCHAR(50) NOT NULL UNIQUE,
  Description NVARCHAR(MAX),
  Percentage DECIMAL(5,2) NOT NULL,
  StartDate DATE NOT NULL,
  EndDate DATE NOT NULL,
  Status NVARCHAR(50) NOT NULL DEFAULT 'Active',
  CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);

-- Ratings (Vleresimet)
CREATE TABLE Ratings (
  RatingId INT IDENTITY(1,1) PRIMARY KEY,
  EventId INT NOT NULL,
  ClientId INT NOT NULL,
  Rating INT NOT NULL, -- 1-5 stars
  Comment NVARCHAR(MAX),
  RatingDate DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  FOREIGN KEY (EventId) REFERENCES Events(EventId),
  FOREIGN KEY (ClientId) REFERENCES Clients(ClientId)
);

-- Create indexes for common queries
CREATE INDEX idx_Events_VenueId ON Events(VenueId);
CREATE INDEX idx_Events_Status ON Events(Status);
CREATE INDEX idx_Sectors_VenueId ON Sectors(VenueId);
CREATE INDEX idx_Tickets_EventId ON Tickets(EventId);
CREATE INDEX idx_Tickets_SectorId ON Tickets(SectorId);
CREATE INDEX idx_Tickets_Status ON Tickets(Status);
CREATE INDEX idx_Orders_ClientId ON Orders(ClientId);
CREATE INDEX idx_Orders_Status ON Orders(Status);
CREATE INDEX idx_OrderDetails_OrderId ON OrderDetails(OrderId);
CREATE INDEX idx_Payments_OrderId ON Payments(OrderId);
CREATE INDEX idx_Payments_Status ON Payments(Status);
CREATE INDEX idx_EventOrganizers_EventId ON EventOrganizers(EventId);
CREATE INDEX idx_Ratings_EventId ON Ratings(EventId);
CREATE INDEX idx_Ratings_ClientId ON Ratings(ClientId);

-- Partners
CREATE TABLE Partners (
  id INT IDENTITY(1,1) PRIMARY KEY,
  name NVARCHAR(200) NOT NULL,
  logo_url NVARCHAR(500),
  link NVARCHAR(500),
  description NVARCHAR(MAX),
  created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
