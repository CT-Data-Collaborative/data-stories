require(reshape2)
pyramid <- read.csv("pyramiddata.csv", stringsAsFactors=FALSE)

pyramid.melt <- melt(pyramid, id.vars=c("sex", "year"))
names(pyramid.melt) <- c("sex", "year", "age", "people")

pyramid.melt$age <- sapply(pyramid.melt$age, function(x) {
  gsub("X","",x)
})

write.csv(file="longpyramid.csv", pyramid.melt, row.names=FALSE)