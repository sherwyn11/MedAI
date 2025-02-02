## intent:greet
- hi bot are you there
- hey bot
- good morning
- dear sir
- hey i hope you are doing good
- hello bot
- goodevenin
- hi wassup
- good afternoon
- hello
- hey are you there
- hey
- hi whatsup
- i hope you are doing great
- hi bot
- goodmorning
- hey how are you
- hey bot how are you
- good evening
- hello how are you
- mornin
- hi
- hey there
- let's go
- hii

## intent:goodbye
- goodbye
- end
- bye bot
- bye
- have a good one
- stop
- good bye
- farewell

## intent:thanks
- thank you so much
- it helped a lot
- thanks a lot
- okay thank you
- oh thanks!
- cool
- nice
- thanks
- yup thanks
- yes it did, thanks a lot

## intent:affirm
- yes plz
- wonderful
- it would be amazing if you can do it
- correct
- of course
- that's right
- sure, that'd be great
- great
- yep
- yup order
- yes i would love to order it
- yea
- why not
- very good
- ya good job
- ok
- carry on with ordering
- amazing
- sure please do
- yes proceed
- oh great, plz order it for me
- okay
- perfect
- next
- continue
- yes please
- yes
- ok cool

## intent:deny
- I don't think so
- never
- nope
- not exactly
- no way
- don't like that

## intent:bot_challenge
- who are you?
- am I talking to a human?
- are you a bot?
- are you a human?

## intent:help
- what can you do?
- what do you do?
- help me
- help
- What are the things that you can do?
- what can you help me with?
- how can you help me
- how do I use this

## intent:nearby_location
- 230 Signal Hill Rd, St. John's, NL A1A 1B3, Canada
- Bandra West Mumbai
- Apollo Bandar, Colaba
- borivali east

## intent:find_product_by_name
- Could you place an order for [Ator](product) please
- [Piroxicam beta-cyclodextrin](product)
- could you search for [Trimag](product)
- [20](quantity) strips of [Thyronorm](product)
- [Ibuprofen](product)
- I would like to buy [Aspirin](product)
- [Vaccine BCG](product)
- Could you place an order for [Onabet](product) please
- I would like to get [Januvia](product)
- I would like to get [Bandax](product)
- I would like you to search for [Humira](product)
- drug [Teramoxyl](product)
- I want to buy [Bactreat-B](product)
- drug [Ulcenon](product)
- I want to get [Thyronorm](product)
- I'd like to place an order for [Crocin](product)
- I want to get [TLC Vita](product)
- [Sinolip](product)
- Do you have [Zepim](product)
- medicine [Sulfalene](product)
- search [Pediavent](product)
- place an order for [100](quantity) units of [Crocin](product)
- could you get me [10](quantity) strips of [Paracetamol](product)
- find [Naproxen](product)
- [Winmero](product) [90](quantity) bottles

## intent:qty_entry
- [15](quantity) bottle
- [20](quantity) please
- about three only
- ten strips
- hundred units
- [10](quantity) strips
- fifteen bottle
- [100](quantity) units

## intent:get_product_by_id
- [prod_id_i64yah](product_id)
- [prod_id_63GIV](product_id)
- [prod_id_I44IAB](product_id)
- [prod_id_yCa12s](product_id)

## intent:get_order_history
- Find previous orders
- all orders summary
- My history
- Get history of orders
- Get all my orders
- could I get my previous orders

## regex:product_id
- \bprod_id_\w+\b

## regex:quantity
- \b[0-9]{1,}\b

## lookup:drugs.txt
  data/lookup_tables/drugs.txt
