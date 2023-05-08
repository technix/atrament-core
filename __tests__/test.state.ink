VAR stamina = 0
VAR coins = 0

State test
-> start

= start
~ stamina += 2
~ coins += 2
P1
+ stamina
    ~ stamina += 40
    -> p2
+ coins
    ~ coins += 40
    -> p2
= p2
STAMINA: {stamina}
COINS: {coins}
-> END
