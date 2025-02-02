## intent:greet
- hey
- hello
- hi
- dear sir
- good morning
- good evening
- mornin
- good afternoon
- goodmorning
- goodevenin
- hey there
- hey are you there
- hey bot
- hi bot are you there
- hii
- hellooo
- hey how are you
- hey i hope you are doing good
- hi bot
- hi mr bot
- hey dude
- hello bot
- hello mate
- hi wassup
- hi whatsup
- hey wassup
- hey whatsup
- i hope you are doing great
- hey bot how are you
- hello how are you
- let's go
- let's get started

## intent:goodbye
- bye
- goodbye
- good bye
- stop
- end
- farewell
- have a good one
- see you around
- see you later
- bye bot

## intent:thanks
- thanks
- thank you
- thank you so much
- oh thanks!
- yes, thanks
- yup thanks
- thx
- thanks a lot
- nice
- cool
- okay thank you
- it helped a lot
- yes it did, thanks a lot

## intent:affirm
- yes
- yes plz
- indeed
- of course
- that sounds good
- correct
- yes please
- why not
- sure please do
- ok cool
- that's right
- ya good job
- yup
- next
- carry on
- it would be amazing if you can do it
- oh great, plz order it for me
- yes proceed
- continue
- sure, that'd be great
- yea
- yep
- yes why not
- go ahead
- yes its ok
- yes it did
- yeah
- ok
- okay
- perfect
- very good
- great
- amazing
- wonderful

## intent:deny
- no
- never
- I don't think so
- don't like that
- no way
- not really
- not exactly
- nope

## intent:bot_challenge
- are you a bot?
- are you a human?
- am I talking to a bot?
- am I talking to a human?
- who are you?

## intent:help
- help
- what can you do?
- what can I ask you?
- what do you do?
- what can you help me with?
- help me
- help, what do you do
- how do I use this
- how can you help me
- What are the things that you can do?

## intent:nearby_location
- Bandra West Mumbai
- borivali east
- Champ de Mars, 5 Avenue Anatole France
- Apollo Bandar, Colaba
- 230 Signal Hill Rd, St. John's, NL A1A 1B3, Canada

## intent:find_product_by_name
- I want to buy [Crocin](product)
- I want to buy [Bactreat-B](product)
- I want to get [Thyronorm](product)
- I want to get [TLC Vita](product)
- I would like to buy [Aspirin](product)
- I would like to get [Bandax](product)
- Could you place an order for [Onabet](product) please
- Could you place an order for [Ator](product) please
- Order [Ophtasone](product) please
- search [Pediavent](product)
- search [Bausch & Lomb Computer Eye Drops](product)
- could you search for [Trimag](product)
- drug [Ulcenon](product)
- I would like you to search for [Humira](product)
- I would like to get [Januvia](product)
- I'd like to place an order for [Crocin](product)
- [Ibuprofen](product)
- [Sinolip](product)
- [Piroxicam beta-cyclodextrin](product)
- [Vaccine BCG](product)
- drug [Ventar](product)
- drug [Teramoxyl](product)
- find drug name [Pharex Aciclovir](product)
- find [Naproxen](product)
- Do you have [Zepim](product)
- drug brand name [Zynaphar](product)
- medicine [Sulfalene](product)
- find medi [Flumex](product)
- could you get me [10](quantity) strips of [Paracetamol](product)
- place an order for [100](quantity) units of [Crocin](product)
- [Winmero](product) [90](quantity) bottles
- [20](quantity) strips of [Thyronorm](product)

## intent:qty_entry
- [10](quantity) strips
- [15](quantity) bottle
- about [3](quantity) only
- [20](quantity) please
- [100](quantity) units
- ten strips
- fifteen bottle
- about three only
- twenty please
- hundred units

## intent:get_product_by_id
- [prod_id_63GIV](product_id)
- [prod_id_wGz46](product_id)
- [prod_id_4661Q1](product_id)
- [prod_id_yCa12s](product_id)
- [prod_id_I44IAB](product_id)
- [prod_id_i64yah](product_id)

## intent:get_order_history
- Get all my orders
- Find all orders
- Get history of orders
- My history
- fetch orders summary
- all orders summary
- could I get my previous orders
- Find previous orders

## intent:set_reminder
- Remind me to take my medicine at [8 PM on July 15](time)
- Set an alarm for my [Aspirin](product) dose at [9:30 AM on Monday](time)
- Can you remind me to take my [Thyronorm](product) at [7 AM on August 1](time)?
- I need a reminder to take my meds in the [morning on Friday](time)
- Alert me when it's time for my [paracetamol](product) at [10 PM on July 20](time)
- Remind me every [day](recurrence) at [10 AM](time) to take [Onabet](product)
- Set a [daily](recurrence) alarm at [6 AM](time) for my medication
- Schedule a reminder for my next dose of [Crocin](product) at [3 PM in 2 days](time)
- Remind me in [3 days at 5 pm](time) to refill my [Januvia](product) prescription
- Please set a reminder for my meds at [5:30 PM on September 10](time)
- I need to reorder [Bactreat-B](product) at [2 PM in a week](time)
- Can you notify me every [Monday](recurrence) at [8 AM](time) to take [Humira](product)?
- Remind me to take my vitamins at [7 PM](time) every [week](recurrence)
- Set a weekly reminder at [9 AM](time) on [Sunday](recurrence)
- Remind me on [January 1 at 6 AM](time) to start my new prescription

## intent:get_reminders
- What are my reminders?
- Show me my upcoming reminders
- Remind me of my scheduled tasks
- Tell me my reminders
- Can you show me my reminders?

## regex:recurrence
- \b(?:every (?:day|week|month|year|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday))\b
- \b(?:daily|weekly|monthly|yearly)\b

## regex:product_id
- \bprod_id_\w+\b

## regex:quantity
- \b[0-9]{1,}\b

## lookup:drugs.txt
data/lookup_tables/drugs.txt
