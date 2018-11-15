#!/usr/bin/perl


# System time for logging
my $tim=localtime();

open (LOG, ">>./kkmnew.log") or die "$!";
print LOG "$tim ticket=$ticket operator=$operator summ=$summ login=$login\n";
close (LOG);
