## intent:greet
- hey dude
- hellooo
- hello mate
- let's get started
- hi mr bot
- hey whatsup
- hey wassup

## intent:goodbye
- see you around
- see you later

## intent:thanks
- thx
- thank you
- yes, thanks

## intent:affirm
- yes its ok
- indeed
- yes it did
- yes why not
- go ahead
- that sounds good
- yeah

## intent:deny
- no
- not really

## intent:bot_challenge
- am I talking to a bot?

## intent:help
- help, what do you do
- what can I ask you?

## intent:nearby_location
- Champ de Mars, 5 Avenue Anatole France

## intent:find_product_by_name
- I want to buy [Crocin](product)
- search [Bausch & Lomb Computer Eye Drops](product)
- find medi [Flumex](product)
- drug [Ventar](product)
- drug brand name [Zynaphar](product)
- find drug name [Pharex Aciclovir](product)
- Order [Ophtasone](product) please

## intent:qty_entry
- about [3](quantity) only
- twenty please

## intent:get_product_by_id
- [prod_id_4661Q1](product_id)
- [prod_id_wGz46](product_id)

## intent:get_order_history
- fetch orders summary
- Find all orders

## regex:product_id
- \bprod_id_\w+\b

## regex:quantity
- \b[0-9]{1,}\b

## lookup:drugs.txt
  data/lookup_tables/drugs.txt
