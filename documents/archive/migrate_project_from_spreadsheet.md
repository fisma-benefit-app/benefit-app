# Migrate a project from spreadsheet to Benefit 30.4.2026

- Add a project from the Benefit UI
- Find a way to generate SQL from the spreadsheet input
- The components need to be added to functional_components
- Project id can now be gotten from the url or database
- To sort by SQL select the desired rows and get the field to sort by, id and order_position. e.g. title, id, order_position
```
Foobar, 123, 1
Babar, 456, 2 
```
- Change the list somehow, e.g. in vim, to the desired order
```
Babar, 456, 2 
Foobar, 123, 1
```

- Copy the relevant fields of the list e.g.
```
456, 2 
123, 1
```

- Add SQL around them e.g. using a multiline editing feature (blockwise in vim)
```
UPDATE functional_components set order_position = 2 WHERE ID = 456
UPDATE functional_components set order_position = 1 WHERE ID = 123
```

- If you want to sort a subset or rows, limit the select which fetches the desired rows.
- You can use e.g. vim's sub-replace-special feature to add a running number from line numbers. e.g. if there are the following lines in the editor on lines 27, 28 and 29
```
1
2
3
```
- You can use this to change those lines to be the line number +1
```
27,29s/\d/\=(line(".")+1)/
```
Resulting in
```
28
29
30
```
