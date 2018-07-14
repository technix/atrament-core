VAR church_enabled = false

Я приехал в Риверкросс.

+ [Поселиться в гостиницу] -> hotel

== house
    Я нахожусь у дома Томаса.
+ [Уйти] -> map

== church
    Я нахожусь у церкви.
+ [Уйти] -> map

== store
    Я нахожусь у магазина.
+ [Уйти] -> map

== hotel
    Я нахожусь возле гостиницы.
+ [Уйти] -> map

== seaside
    Я нахожусь на побережье.
+ [Уйти] -> map

== map
# scene: map
# bg: bg-citymap.jpg
# point_house: [ "Дом Томаса", 40, 420, "ae-house.png" ]
# point_church: [ "Церковь", 60, 320, "ae-church.png" ]
# point_store: [ "Магазин", 170, 240, "ae-general_store.png" ]
# point_hotel: [ "Гостиница", 180, 440, "ae-historical.png" ]
# point_seaside: [ "Берег моря", 250, 80, "ae-harbor.png" ]

+ [point_house] 
    >>> CLEAR
    -> house
+ {church_enabled} [point_church]
    >>> CLEAR
    -> church
+ [point_store]
    >>> CLEAR
    -> store
+ [point_hotel]
    >>> CLEAR
    -> hotel
+ [point_seaside]
    >>> CLEAR
    -> seaside
