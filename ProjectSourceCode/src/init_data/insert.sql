INSERT INTO users
(username, password, wallet)
VALUES
--If you want to test yourself, the password is the same for everyone which is "lmnop"
('Noah','$2b$10$zYuTFaV3uXI1X54Cj0dCQO1HnKQPTSYk1S7CUF7lYoYMS7cKVDP82', 6354.31),
('Ben','$2b$10$zYuTFaV3uXI1X54Cj0dCQO1HnKQPTSYk1S7CUF7lYoYMS7cKVDP82', 71464.22),
('Jace','$2b$10$zYuTFaV3uXI1X54Cj0dCQO1HnKQPTSYk1S7CUF7lYoYMS7cKVDP82', 7454.86),
('Lucca','$2b$10$zYuTFaV3uXI1X54Cj0dCQO1HnKQPTSYk1S7CUF7lYoYMS7cKVDP82', 69247.40),
('Owen','$2b$10$zYuTFaV3uXI1X54Cj0dCQO1HnKQPTSYk1S7CUF7lYoYMS7cKVDP82', 454752.35),
('Logan','$2b$10$zYuTFaV3uXI1X54Cj0dCQO1HnKQPTSYk1S7CUF7lYoYMS7cKVDP82', 594220.40),
--Username and password "a"
('a','$2b$10$whBSEpqgXwZRCDV9Sl.wtedvQ7KpM8Onq5W1XXf658xsateej3qIq', 0.00);

INSERT INTO friendships
(user_username, friend_username, outstanding_balance)
VALUES
('Noah', 'Ben', 296.57),
('Ben', 'Noah', -296.57),
('Noah', 'Jace', 682.16),
('Jace', 'Noah', -682.16),
('Noah', 'Lucca', 50.92),
('Lucca', 'Noah', -50.92),
('Noah', 'Owen', 820.10),
('Owen', 'Noah', -820.10),
('Noah', 'Logan', 321.99),
('Logan', 'Noah', -321.99),
('Owen', 'Ben', 314.23),
('Ben', 'Owen', -314.23),
('Owen', 'Jace', 554.46),
('Jace', 'Owen', -554.46),
('Ben', 'Lucca', 708.52),
('Lucca', 'Ben', -708.52),
('Jace', 'Lucca', 797.49),
('Lucca', 'Jace', -797.49),
('Logan', 'Lucca', 499.20),
('Lucca', 'Logan', -499.20);

INSERT INTO groups
(id, group_admin_username, group_name)
VALUES
(1, 'Noah', 'WW'),
(2, 'Ben', 'Elephant'),
(3, 'Noah', 'Laufey Fan Club'),
(4, 'Jace', 'Blood brothers');

INSERT INTO group_members
(group_id, username, outstanding_balance)
VALUES
(1, 'Ben', 0),
(1, 'Jace', 93),
(1, 'Lucca', 3),
(1, 'Owen', 55),
(1, 'Logan', 34.21),
(2, 'Lucca', 80.20),
(2, 'Jace', 1),
(2, 'Noah', 0),
(3, 'Logan', 22),
(3, 'Lucca', 10),
(4, 'Noah', 2),
(4, 'Ben', 55.66);

INSERT INTO transactions_group
(charge_amount, charge_desc, date, requester_username, group_id)
VALUES
(204, 'Group dinner', '2023-10-24', 'Noah', 1),
(6, 'Everyone pays 1 dollar haha', '2024-01-24', 'Ben', 1),
(169, 'Concert tickets', '202-08-23', 'Noah', 3),
(5300, 'Road trip money', '2024-04-04', 'Jace', 2);

INSERT INTO transactions_individual
(charge_amount, charge_desc, date, sender_username, recipient_username, group_name)
VALUES
(52.54, 'Groceries payback', '2024-04-10', 'Noah', 'Ben', 'WW'),
(8.99, 'Museum', '2024-04-17', 'Owen', 'Ben', 'WW'),
(65.46, 'Velveeta super pack', '2024-03-24', 'Jace', 'Logan', 'WW'),
(70.73, 'Chinese food', '2024-02-22', 'Logan', 'Lucca', 'WW'),
(3.33, 'Paper', '2024-01-22', 'Logan', 'Lucca', 'WW'),
(33.44, 'New hat', '2024-04-14', 'Ben', 'Jace', 'WW'),
(77.99, 'Gambling money', '2024-01-01', 'Logan', 'Owen', 'WW'),
(12345.67, 'My life savings', '2024-03-04', 'Jace', 'Lucca', 'WW'),
(69, ';)', '2024-04-01', 'Owen', 'Jace', 'WW'),
(81, '54 Costco Hot Dogs', '2024-02-21', 'Noah', 'Ben', 'WW');