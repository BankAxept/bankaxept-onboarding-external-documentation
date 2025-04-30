# Valid Account Numbers 

The modulus 11 algorithm for Norwegian bank account numbers is used to validate the check digit at the end of the account number.

## Structure 
A Norwegian bank account number consists of 11 digits, where the first 4 digits represent the [bank reg number](dictionary.md) and the last digit is a check digit. 

## Calculation
To display the calculation of the check digit, we will use the following example account number: 
```
15067328555
```


### Weights
Assign weights to the first 10 digits of the account number. The weights are: 2, 3, 4, 5, 6, 7, 2, 3, 4, 5 (repeating after 7).
```
5 (weight 3)
5 (weight 4)
8 (weight 5)
2 (weight 6)
3 (weight 7)
7 (weight 2)
6 (weight 3)
0 (weight 4)
5 (weight 5)
1 (weight 6)
```

### Multiply and Sum
Multiply each digit by its corresponding weight and sum the results:
```
5 * 3 = 15
5 * 4 = 20
8 * 5 = 40
2 * 6 = 12
3 * 7 = 21
7 * 2 = 14
6 * 3 = 18
0 * 4 = 0
5 * 5 = 25
1 * 6 = 6
```

The sum is 
```
15 + 20 + 40 + 12 + 21 + 14 + 18 + 0 + 25 + 6 = 171
```

### Modulo Operation
Now, take the sum and divide it by 11 and find the remainder:
```
171 % 11 = 6
```

### Check Digit
Subtract the remainder from 11 to get the check digit:
```
11 - 6 = 5
```
It is important to note that if the result is 11, the check digit is 0. If the result is 10, the account number is invalid.

In this case, the check digit is 5, which matches the last digit of the account number. Therefore, the account number **15067328555** is valid.
